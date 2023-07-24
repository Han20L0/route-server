const fs = require("fs");
const { INTERSECTIONS_PATH, DISTANCE_PATH, GEOMETRY_PATH, INTERSECTION_CONNECTOR } = require("../filenames");

function promisify(connection, query, values) {
  if (values) {
    return new Promise((resolve, reject) => {
      connection.query(query, values, function (err, result) {
        if (err) reject(err);
        resolve();
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      connection.query(query, function (err, result) {
        if (err) reject(err);
        resolve();
      });
    });
  }
}

function print_progress(text) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

async function create_intersections_table(mysqlConnection) {
  print_progress(`creating intersections table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_intersections (id int(11) NOT NULL,source_node_id bigint(20) NOT NULL,target_node_id bigint(20) NOT NULL,via_way_id bigint(20) NOT NULL, source_lat double NOT NULL, source_lon double NOT NULL, target_lat double NOT NULL, target_lon double NOT NULL, is_accessible_car int(1) NOT NULL, is_accessible_motor int(1) NOT NULL, connector_list longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(connector_list))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_intersections ADD PRIMARY KEY (id), ADD UNIQUE KEY unique_data (source_node_id,target_node_id,via_way_id), ADD KEY target_node_id (target_node_id), ADD KEY via_way_id (via_way_id), ADD KEY source_node_id (source_node_id) USING BTREE;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_intersections MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_intersections ADD CONSTRAINT tb_intersections_ibfk_1 FOREIGN KEY (source_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_intersections_ibfk_2 FOREIGN KEY (target_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_intersections_ibfk_3 FOREIGN KEY (via_way_id) REFERENCES tb_ways (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating intersections table finished`);
  console.log();
}

async function store_intersections_entries(mysqlConnection) {
  print_progress(`storing intersections data...`);

  const intersections = JSON.parse(fs.readFileSync(INTERSECTIONS_PATH));

  let count = 0;
  let query_list = [];

  for (const id in intersections) {
    const [source_node_id, target_node_id, via_way_id] = id.split(",");
    const {
      isAccessibleCar,
      isAccessibleMotor,
      connector_list,
      source_coordinate: { lat: sourceLat, lon: sourceLon },
      target_coordinate: { lat: targetLat, lon: targetLon },
    } = intersections[id];

    const query = `INSERT INTO tb_intersections (source_node_id, target_node_id, via_way_id, source_lat, source_lon, target_lat, target_lon, is_accessible_car, is_accessible_motor, connector_list) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      parseInt(source_node_id),
      parseInt(target_node_id),
      parseInt(via_way_id),
      sourceLat,
      sourceLon,
      targetLat,
      targetLon,
      isAccessibleCar,
      isAccessibleMotor,
      JSON.stringify(connector_list),
    ];

    query_list.push(promisify(mysqlConnection, query, values));
    count++;
  }
  await Promise.all(query_list);

  print_progress(`storing intersection entries finished. total data: ${count}`);
}

async function store_intersections(mysqlConnection) {
  await create_intersections_table(mysqlConnection);
  await store_intersections_entries(mysqlConnection);
}

module.exports = store_intersections;
