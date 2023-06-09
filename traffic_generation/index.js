const get_day_hour = require("./day_hour");
const db_setup = require("./db_setup");
const generate_connector_traffic_data = require("./generate_connector");
const fetch_traffic_data = require("./load_traffic");
const store_connector_traffic = require("./store");

async function generate_traffic() {
  // generating traffic approaches
  // 1. set random/real time and day
  // 2. load data of specific day\time from traffic dataset
  // 3. get every wayID and their percentages
  // 4. get every connector related to each wayIDs
  // 5. set every connector traffic color based on their wayID percentages
  // 6. store connectionID and it's traffic color in (MySQL DB / Express local)

  // 0. check database
  await db_setup();

  // 1. set random/real time and day
  let { dayName, hour, minute } = get_day_hour();
  console.log("start");

  // 2. load data of specific day\time from traffic dataset
  // 3. get every wayID and their percentages
  console.log("fetching");
  const traffic_data = await fetch_traffic_data(dayName, hour, minute);
  console.log("fetching finished");

  // 4. get every connector related to each wayIDs
  // 5. set every connector traffic color based on their wayID percentages
  console.log("generating");
  const generated_connector_traffic_data = await generate_connector_traffic_data(traffic_data);
  console.log("generating finished");

  // 6. store connectionID and it's traffic color in (MySQL DB / Express local)
  console.log("generating");
  await store_connector_traffic(generated_connector_traffic_data);
  console.log("generating finished");
}

module.exports = generate_traffic;
