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
  print_progress(`creating traffic light nodes table...`);

  let query = `CREATE TABLE tb_connectors ( id int(11) NOT NULL, source_node_id bigint(20) NOT NULL, target_node_id bigint(20) NOT NULL, via_way_id bigint(20) NOT NULL, geometry varchar(8192) NOT NULL, is_accessible int(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_connectors ADD PRIMARY KEY (id), ADD KEY source_node_id (source_node_id), ADD KEY target_node_id (target_node_id), ADD KEY via_way_id (via_way_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_connectors MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_connectors ADD CONSTRAINT tb_connector_ibfk_1 FOREIGN KEY (source_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_connector_ibfk_2 FOREIGN KEY (target_node_id) REFERENCES tb_nodes (id), ADD CONSTRAINT tb_connector_ibfk_3 FOREIGN KEY (via_way_id) REFERENCES tb_ways (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating traffic light nodes table finished`);
  console.log();
}

async function store_connectors(mysqlConnection) {
  print_progress(`storing connectors data...`);

  const connectors = JSON.parse(fs.readFileSync(CONNECTOR_PATH));

  const query_list = [];
  let count = 0;

  for (const source_node_id in connectors) {
    const query = `INSERT INTO tb_connectors (source_node_id, target_node_id, via_way_id, geometry, is_accessible) VALUES (?, ?, ?, ?, ?)`;

    for (const targetNode of connectors[source_node_id]) {
      const { target: target_node_id, viaWayID, geometry, isAccessible } = targetNode;
      const values = [parseInt(source_node_id), parseInt(target_node_id), parseInt(viaWayID), geometry, isAccessible];

      query_list.push(promisify(mysqlConnection, query, values));
      count++;
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
