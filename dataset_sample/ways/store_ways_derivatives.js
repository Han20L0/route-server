const fs = require("fs");
const { CONNECTOR_PATH } = require("../filenames");

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

async function create_connectors_table(mysqlConnection) {
  print_progress(`creating connectors table...`);

  let query = `CREATE TABLE tb_connector ( id int(11) NOT NULL, source_lat float NOT NULL, source_lon float NOT NULL, target_lat float NOT NULL, target_lon float NOT NULL, source_node_id bigint(20) NOT NULL, target_node_id bigint(20) NOT NULL, via_way_id bigint(20) NOT NULL, geometry varchar(8192) NOT NULL, is_accessible_car int(1) NULL, is_accessible_motor int(1) NULL, cardinal varchar(20) NOT NULL, heading varchar(20) NOT NULL, angle float NOT NULL, distance float NOT NULL, duration float NOT NULL, n_distance float NOT NULL, n_duration float NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  // query = `ALTER TABLE tb_connector ADD CONSTRAINT tb_connector_ibfk_1 FOREIGN KEY (source_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_connector_ibfk_2 FOREIGN KEY (target_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_connector_ibfk_3 FOREIGN KEY (via_way_id) REFERENCES tb_ways (id);`;
  // await promisify(mysqlConnection, query);

  print_progress(`creating connectors table finished`);
  console.log();
}

async function store_connectors(mysqlConnection) {
  print_progress(`storing connectors data...`);

  const connectors = JSON.parse(fs.readFileSync(CONNECTOR_PATH));

  let query_list = [];
  let count = 0;

  for (const id in connectors) {
    const [numberID, source_node_id, target_node_id, viaWayID] = id.split(",");
    const {
      geometry,
      isAccessibleCar,
      isAccessibleMotor,
      direction: { heading, cardinal, angle },
      coordinates: {
        source: { sourceLat, sourceLon },
        target: { targetLat, targetLon },
      },
      d_d: { distance, duration },
      d_d_normalized: { distance: n_distance, duration: n_duration },
    } = connectors[id];

    const query = `INSERT INTO tb_connector (id,  source_node_id, target_node_id, via_way_id, geometry, source_lat, source_lon, target_lat, target_lon, is_accessible_car, is_accessible_motor, cardinal, heading, angle, distance, duration, n_distance, n_duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      numberID,
      parseInt(source_node_id),
      parseInt(target_node_id),
      parseInt(viaWayID),
      geometry,
      sourceLat,
      sourceLon,
      targetLat,
      targetLon,
      isAccessibleCar,
      isAccessibleMotor,
      cardinal,
      heading,
      angle,
      distance,
      duration,
      n_distance,
      n_duration,
    ];

    query_list.push(promisify(mysqlConnection, query, values));
    count++;

    if (count % 10000 === 0) {
      console.log("waiting queue");
      await Promise.all(query_list);
      query_list = [];
    }
  }

  await Promise.all(query_list);

  print_progress(`storing connectors data finished. total data: ${count}`);
  console.log();
}

async function store_ways_derivatives(mysqlConnection) {
  await create_connectors_table(mysqlConnection);
  await store_connectors(mysqlConnection);
}

module.exports = store_ways_derivatives;
