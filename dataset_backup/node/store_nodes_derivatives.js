const fs = require("fs");
const { TRAFFIC_SIGNAL_NODES_PATH } = require("../filenames");

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

async function create_traffic_light_nodes_table(mysqlConnection) {
  print_progress(`creating traffic light nodes table...`);

  let query = `CREATE TABLE tb_traffic_light_nodes (node_id bigint(20) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffic_light_nodes ADD PRIMARY KEY (node_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffic_light_nodes ADD CONSTRAINT tb_traffic_light_nodes_ibfk_1 FOREIGN KEY (node_id) REFERENCES tb_nodes (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating traffic light nodes table finished`);
  console.log();
}

async function store_traffic_light_nodes(mysqlConnection) {
  print_progress(`storing traffic light nodes data...`);

  const traffic_light_nodes = JSON.parse(fs.readFileSync(TRAFFIC_SIGNAL_NODES_PATH));

  const query_list = [];
  let count = 0;

  for (const node_id of traffic_light_nodes) {
    const query = `INSERT INTO tb_traffic_light_nodes (node_id) VALUES (${node_id})`;

    query_list.push(promisify(mysqlConnection, query));
    count++;
  }

  await Promise.all(query_list);

  print_progress(`storing traffic light nodes data finished. total data: ${count}`);
  console.log();
}

async function store_nodes_derivatives(mysqlConnection) {
  await create_traffic_light_nodes_table(mysqlConnection);
  await store_traffic_light_nodes(mysqlConnection);
}

module.exports = store_nodes_derivatives;
