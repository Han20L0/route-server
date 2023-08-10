const fs = require("fs");
const { WAYS_PATH, NODES_PATH } = require("../filenames");

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

async function create_ways_db(mysqlConnection) {
  print_progress(`creating ways table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_ways (id bigint(20) NOT NULL,nodes longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(nodes)),tags longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(tags))) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);

  query = `ALTER TABLE tb_ways ADD PRIMARY KEY (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating ways table finished`);
  console.log();
}

async function create_nodes_db(mysqlConnection) {
  print_progress(`creating nodes table...`);

  let query = `CREATE TABLE IF NOT EXISTS tb_nodes ( id bigint(20) NOT NULL, lat double NOT NULL, lon double NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_nodes ADD PRIMARY KEY (id);`;
  await promisify(mysqlConnection, query);

  print_progress(`creating nodes table finished`);
  console.log();
}

async function store_ways(mysqlConnection) {
  print_progress(`storing ways data...`);

  const waysdata = JSON.parse(fs.readFileSync(WAYS_PATH));

  const query_list = [];
  let count = 0;

  for (const waysID in waysdata) {
    const ways = waysdata[waysID];
    const query = `INSERT INTO tb_ways (id,nodes,tags) VALUES (?, ?, ?)`;
    const values = [waysID, JSON.stringify(ways.nodes), JSON.stringify(ways.tags)];

    query_list.push(promisify(mysqlConnection, query, values));
    count++;
  }

  await Promise.all(query_list);

  print_progress(`storing ways data finished. total data: ${count}`);
  console.log();
}

async function store_nodes(mysqlConnection) {
  print_progress(`storing nodes data...`);

  const nodesData = JSON.parse(fs.readFileSync(NODES_PATH));

  const query_list = [];
  let count = 0;

  for (const nodeID in nodesData) {
    const { lat, lon } = nodesData[nodeID];

    const query = `INSERT INTO tb_nodes (id, lat, lon) VALUES (?, ?, ?)`;
    const values = [parseInt(nodeID), lat, lon];
    // console.log(values);

    query_list.push(promisify(mysqlConnection, query, values));
    count++;
  }

  await Promise.all(query_list);

  print_progress(`storing nodes data finished. total data: ${count}`);
  console.log();
}
async function store_source(mysqlConnection) {
  await create_ways_db(mysqlConnection);
  await store_ways(mysqlConnection);

  await create_nodes_db(mysqlConnection);
  await store_nodes(mysqlConnection);
}

module.exports = store_source;
