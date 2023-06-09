const fs = require("fs");
const { INTERSECTIONS_PATH, DISTANCE_PATH, GEOMETRY_PATH, INTERSECTION_CONNECTOR } = require("../filenames");

function promisify(connection, query, values) {
  if (values) {
    return new Promise((resolve, reject) => {
      connection.query(query, values, function (err, result) {
        if (err) reject(err);
        if (result.insertId) resolve(result.insertId);
        resolve();
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      connection.query(query, function (err, result) {
        if (err) reject(err);
        if (result.insertId) resolve(result.insertId);
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

  let query = `CREATE TABLE IF NOT EXISTS tb_intersections (id int(11) NOT NULL,source_node_id bigint(20) NOT NULL,target_node_id bigint(20) NOT NULL,via_way_id bigint(20) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
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

async function create_distance_table(mysqlConnection) {
  print_progress(`creating distance table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_distance ( inter_id int(11) NOT NULL, duration float NOT NULL, distance float NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_distance ADD PRIMARY KEY (inter_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_distance ADD CONSTRAINT tb_distance_ibfk_1 FOREIGN KEY (inter_id) REFERENCES tb_intersections (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating distance table finished`);
  console.log();
}

async function create_geometry_table(mysqlConnection) {
  print_progress(`creating geometry table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_geometry (inter_id int(11) NOT NULL,geometry varchar(8192) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_geometry ADD PRIMARY KEY (inter_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_geometry ADD CONSTRAINT tb_geometry_ibfk_1 FOREIGN KEY (inter_id) REFERENCES tb_intersections (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating geometry table finished`);
  console.log();
}

async function create_intersection_connectors_table(mysqlConnection) {
  print_progress(`creating intersection connectors table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_intersection_connectors (inter_id int(11) NOT NULL,connector_list longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(connector_list))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_intersection_connectors ADD PRIMARY KEY (inter_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_intersection_connectors ADD CONSTRAINT tb_intersection_connectors_ibfk_1 FOREIGN KEY (inter_id) REFERENCES tb_intersections (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating intersection connectors table finished`);
  console.log();
}

async function store_intersections_entries(mysqlConnection) {
  print_progress(`storing intersections data...`);

  const intersections = JSON.parse(fs.readFileSync(INTERSECTIONS_PATH));
  const distances = JSON.parse(fs.readFileSync(DISTANCE_PATH));
  const geometries = JSON.parse(fs.readFileSync(GEOMETRY_PATH));
  const connectors = JSON.parse(fs.readFileSync(INTERSECTION_CONNECTOR));

  let count = 0;
  let query_list = [];

  for (const source_node_id in intersections) {
    const intersectionList = intersections[source_node_id];

    intersectionList.forEach(async (item) => {
      const query = `INSERT INTO tb_intersections (source_node_id, target_node_id, via_way_id) VALUES (?, ?, ?)`;
      const values = [parseInt(source_node_id), item.targetNodeId, item.ViaWayId];

      const promise = new Promise(async (resolve, reject) => {
        const insert_id = await promisify(mysqlConnection, query, values);

        const { duration, distance } = distances[source_node_id][item.targetNodeId];
        const queryDistanace = `INSERT INTO tb_distance (inter_id, duration, distance) VALUES (?, ?, ?)`;
        const valuesDistance = [insert_id, duration, distance];

        const distancePromise = promisify(mysqlConnection, queryDistanace, valuesDistance);

        const geometry = geometries[`${source_node_id}${item.targetNodeId}`];
        const queryGeometry = `INSERT INTO tb_geometry (inter_id, geometry) VALUES (?, ?)`;
        const valuesGeometry = [insert_id, geometry];

        const geometryPromise = promisify(mysqlConnection, queryGeometry, valuesGeometry);

        const intersection_connector = connectors[source_node_id][item.targetNodeId];
        const queryConnectors = `INSERT INTO tb_intersection_connectors (inter_id, connector_list) VALUES (?, ?)`;
        const valuesConnectors = [insert_id, JSON.stringify(intersection_connector)];

        const connectorsPromise = promisify(mysqlConnection, queryConnectors, valuesConnectors);

        await Promise.all[(distancePromise, geometryPromise, connectorsPromise)];
        resolve();
      });

      query_list.push(promise);

      count++;
    });
  }

  await Promise.all(query_list);

  print_progress(`storing intersection data finished. total data: ${count}`);
  console.log();
}

async function store_intersections(mysqlConnection) {
  await create_intersections_table(mysqlConnection);
  await create_distance_table(mysqlConnection);
  await create_geometry_table(mysqlConnection);
  await create_intersection_connectors_table(mysqlConnection);

  await store_intersections_entries(mysqlConnection);
}

module.exports = store_intersections;
