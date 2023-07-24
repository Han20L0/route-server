const fs = require("fs");
const { WEATHER_API_DATA_DIR, WEATHER_API_VALUES } = require("../filenames");
const { DATES, DAY_NAMES } = require("../constants").WEATHER_CONSTANTS;

let weather_values;

function init() {
  weather_values = JSON.parse(fs.readFileSync(WEATHER_API_VALUES));
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

async function create_weathers_table(mysqlConnection) {
  print_progress(`creating traffics table...`);

  let query = `CREATE TABLE tb_weathers (id int(11) NOT NULL, lat double NOT NULL, lon double NOT NULL, day varchar(10) NOT NULL,hour int(2) NOT NULL, weather_code int(4) NOT NULL, rating double NOT NULL, normalized_rating double NOT NULL, weather_text VARCHAR(20) NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_weathers ADD PRIMARY KEY (id);`;
  await promisify(mysqlConnection, query);
  query = `ALTER TABLE tb_weathers MODIFY id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;`;
  await promisify(mysqlConnection, query);

  print_progress(`creating weathers table finished`);
  console.log();
}

async function store_weather_entries(mysqlConnection, lat, lon, day_name, hour, code, rating, normalized_rating, text) {
  const query = `INSERT INTO tb_weathers (lat, lon, day, hour, weather_code, rating, normalized_rating, weather_text) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [lat, lon, day_name, hour, code, rating, normalized_rating, text];

  return promisify(mysqlConnection, query, values);
}

function get_weather_rating(code) {
  for (const { code: weather_code, rating } of weather_values) {
    if (weather_code === code) {
      return rating;
    }
  }
}

async function store_weathers_data(mysqlConnection) {
  print_progress(`storing weathers data...`);

  let count = 0;
  let query_list = [];

  for (const [day_index, date] of DATES.entries()) {
    const day_name = DAY_NAMES[day_index];

    const filename = `${WEATHER_API_DATA_DIR}\\${date}.json`;
    const weather_data = JSON.parse(fs.readFileSync(filename));

    for (const latLon in weather_data) {
      let [lat, lon] = latLon.split(",");
      lat = parseFloat(lat);
      lon = parseFloat(lon);

      for (const [hour, data] of weather_data[latLon].entries()) {
        const { text, code } = data.condition;
        const rating = get_weather_rating(code);
        const normalized_rating = rating / 5.7;

        query_list.push(store_weather_entries(mysqlConnection, lat, lon, day_name, hour, code, rating, normalized_rating, text));
        count++;
      }
    }

    await Promise.all(query_list);
    query_list = [];
  }

  print_progress(`storing weathers data finished. total data: ${count}`);
}

function print_progress(text) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(text);
}

async function store_weathers(mysqlConnection) {
  init();

  await create_weathers_table(mysqlConnection);
  await store_weathers_data(mysqlConnection);
}

module.exports = store_weathers;
