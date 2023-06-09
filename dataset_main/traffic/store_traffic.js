const fs = require("fs");
const { TRAFFIC_RESULT_DIR } = require("../filenames");
const { DAY_NAMES, DAY_START, DAY_END, HOUR_START, HOUR_END, MINUTE_START, MINUTE_END, MINUTE_INTERVAL } = require("../constants").TRAFFIC_CONSTANTS;

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

  let query = `CREATE TABLE tb_traffics (id int(11) NOT NULL,way_id bigint(20) NOT NULL,day varchar(10) NOT NULL,hour int(2) NOT NULL, minute int(2) NOT NULL,indicator_values longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffics ADD PRIMARY KEY (id),ADD KEY way_id (way_id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffics MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_traffics ADD CONSTRAINT tb_traffics_ibfk_1 FOREIGN KEY (way_id) REFERENCES tb_ways (id);`;
  await promisify(mysqlConnection, query);

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

      for (let minute = MINUTE_START; minute < MINUTE_END; minute += MINUTE_INTERVAL) {
        let minuteString = minute < 10 ? "0" : "";
        minuteString += minute;

        const filename = `${TRAFFIC_RESULT_DIR}\\${day_name}\\${day_name}_${hourString}.${minuteString}.json`;
        traffic_metadata.push({
          day_name,
          hour,
          minute,
          filename,
        });
      }
    }
  }

  return traffic_metadata;
}

async function store_traffics_entries(mysqlConnection, metadata, data) {
  const { day_name, hour, minute } = metadata,
    { way_id, indicator_values } = data;

  // INSERT INTO `tb_traffic` (`id`, `way_id`, `day`, `hour`, `indicator_values`) VALUES
  const query = `INSERT INTO tb_traffics (way_id, day, hour, minute, indicator_values) VALUES (?, ?, ?, ?, ?)`;
  const values = [parseInt(way_id), day_name, hour, minute, JSON.stringify(indicator_values)];

  return promisify(mysqlConnection, query, values);
}

async function store_traffics(mysqlConnection) {
  print_progress(`storing traffics data...`);

  let count = 0;
  let query_list = [];

  const traffic_metadatas = get_traffic_metadatas();

  for (const traffic_metadata of traffic_metadatas) {
    const { day_name, hour, minute, filename } = traffic_metadata;

    const traffic_datas = JSON.parse(fs.readFileSync(filename));

    for (const way_id in traffic_datas) {
      const indicator_values = traffic_datas[way_id];

      const metadata = { day_name, hour, minute };
      const data = { way_id, indicator_values };

      query_list.push(store_traffics_entries(mysqlConnection, metadata, data));
      count++;
    }

    await Promise.all(query_list);
    query_list = [];
  }

  print_progress(`storing intersection data finished. total data: ${count}`);
  console.log();
}

function print_progress(text) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

async function store_intersections(mysqlConnection) {
  await create_traffics_table(mysqlConnection);
  await store_traffics(mysqlConnection);
}

module.exports = store_intersections;
