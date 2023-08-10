const fs = require("fs");
const { TRAFFIC_RESULT_DIR, CONNECTOR_PATH } = require("../filenames");
const { DAY_NAMES, DAY_START, DAY_END, HOUR_START, HOUR_END } = require("../constants").TRAFFIC_CONSTANTS;

let connectors = {};

function init() {
  connectors = JSON.parse(fs.readFileSync(CONNECTOR_PATH));
}

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

async function create_traffics_table(mysqlConnection) {
  print_progress(`creating traffics table...`);

  let query = `CREATE TABLE tb_traffics (id int(11) NOT NULL,connector_id int(11) NOT NULL,day varchar(10) NOT NULL,hour int(2) NOT NULL,indicator_value int(1) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffics ADD PRIMARY KEY (id),ADD KEY connector_id (connector_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffics MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;`;
  await promisify(mysqlConnection, query);
  // query = `ALTER TABLE tb_traffics ADD CONSTRAINT tb_traffic_ibfk_1 FOREIGN KEY (connector_id) REFERENCES tb_connector (id);`;
  // await promisify(mysqlConnection, query);

  print_progress(`creating traffics table finished`);
  console.log();
}

function get_traffic_metadatas() {
  const traffic_metadata = [];

  for (let day_index = DAY_START; day_index <= DAY_END; day_index++) {
    const day_name = DAY_NAMES[day_index];

    for (let hour = HOUR_START; hour < HOUR_END; hour++) {
      let hourString = hour < 10 ? "0" : "";
      hourString += hour;

      const filename = `${TRAFFIC_RESULT_DIR}\\${day_name}\\${day_name}_${hourString}.00.json`;
      traffic_metadata.push({
        day_name,
        hour,
        filename,
      });
    }
  }

  return traffic_metadata;
}

async function store_traffics_entries(mysqlConnection, metadata, data) {
  const { day_name, hour } = metadata,
    { numberId, indicator_value } = data;

  // INSERT INTO `tb_traffic` (`id`, `way_id`, `day`, `hour`, `indicator_values`) VALUES
  const query = `INSERT INTO tb_traffics (connector_id, day, hour, indicator_value) VALUES (${numberId}, '${day_name}', ${hour}, ${indicator_value})`;

  return promisify(mysqlConnection, query);
}

async function store_traffics_data(mysqlConnection) {
  print_progress(`storing traffics data...`);

  let count = 0;
  let query_list = [];

  const traffic_metadatas = get_traffic_metadatas();

  for (const traffic_metadata of traffic_metadatas) {
    const { day_name, hour, filename } = traffic_metadata;
    print_progress(`storing traffics data ${day_name}, ${hour}:00...`);

    const traffic_datas = JSON.parse(fs.readFileSync(filename));

    for (const id in traffic_datas) {
      const { numberId } = connectors[id];

      if (id === "5477100011,5477100032") {
        console.log("a");
      }

      const { dominantNumber: indicator_value } = traffic_datas[id];

      const metadata = { day_name, hour };
      const data = { numberId, indicator_value };

      query_list.push(store_traffics_entries(mysqlConnection, metadata, data));
      count++;
    }

    await Promise.all(query_list);
    query_list = [];
  }

  print_progress(`storing traffic data finished. total data: ${count}`);
  console.log();
}

function print_progress(text) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

async function store_traffics(mysqlConnection) {
  init();

  const timeStart = performance.now();
  await create_traffics_table(mysqlConnection);
  await store_traffics_data(mysqlConnection);
  const timeEnd = performance.now();

  console.log("Time used for creating and storing", timeEnd - timeStart);
}

module.exports = store_traffics;
