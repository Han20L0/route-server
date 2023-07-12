const get_day_hour = require("./day_hour");
const duplicate_traffic = require("./duplicate_traffic");
const duplicate_weather = require("./duplicate_weather");
const validate_traffic_generation_request_params = require("./validate_params");

async function generate_data(req, res) {
  // generating traffic approaches
  // 1. set random/real time and day
  // 2. duplicate traffics table only with specific day, time, minute into new table

  const { realtime } = validate_traffic_generation_request_params(req.query, res);

  if (typeof realtime !== "boolean") return;

  // 1. set random/real time and day
  let { dayName, hour, minute } = get_day_hour(realtime);
  console.log(`duplicating traffic of ${dayName}, ${hour}:${minute}`);

  // 2. duplicate traffics table only with specific day, time, minute into new table
  await duplicate_traffic(dayName, hour, minute);
  await duplicate_weather(dayName, hour);

  console.log("duplicating finished");

  res.sendStatus(200);
}

module.exports = generate_data;
