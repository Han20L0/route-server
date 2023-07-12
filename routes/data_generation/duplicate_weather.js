const { mysql_query } = require("../../mysql");

async function check_table() {
  const query = `SHOW TABLES LIKE 'tb_current_weather';`;
  const result = await mysql_query(query);

  if (result?.length) return true;
  return false;
}

async function duplicate_table(dayName, hour) {
  const duplicateQuery = `CREATE TABLE tb_current_weather AS SELECT id, lat, lon, weather_code, weather_text, rating, normalized_rating FROM tb_weathers WHERE day='${dayName}' AND hour=${hour}`;
  await mysql_query(duplicateQuery);
}

async function drop_table() {
  const dropQuery = `DROP TABLE tb_current_weather`;
  await mysql_query(dropQuery);
}

async function duplicate_weather(dayName, hour) {
  const isTableExists = await check_table();

  if (isTableExists) {
    await drop_table();
  }

  await duplicate_table(dayName, hour);
}

module.exports = duplicate_weather;
