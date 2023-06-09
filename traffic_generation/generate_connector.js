const { connection, mysql_query } = require("../mysql");

function generate_random_connector_traffic(connectorIDList, traffic_indicator_values) {
  // creating an object (key: connectorID, value: indicator_value, default: 1[green])
  const generated_connector_traffic = {};
  for (const connectorID of connectorIDList) {
    generated_connector_traffic[connectorID] = 1;
  }

  const [_, yellowValue, redValue] = traffic_indicator_values;

  // counting number of yellow and red connectors will be made
  const connectorIDCount = connectorIDList.length,
    totalYellow = Math.floor(yellowValue * connectorIDCount),
    totalRed = Math.floor(redValue * connectorIDCount);

  // array of connectorID with respective traffic colors
  const yellowID = [],
    redID = [];

  function get_random_connector_id() {
    const randomIndex = Math.floor(Math.random() * connectorIDCount);
    return connectorIDList[randomIndex];
  }

  // set yellow traffic on random connectors
  let yellowCount = 0;
  while (yellowCount < totalYellow) {
    const randomConnectorID = get_random_connector_id();

    // skips if random ID already in yellow/red
    if (yellowID.includes(randomConnectorID) || redID.includes(randomConnectorID)) continue;

    // add connector_id to color
    yellowID.push(randomConnectorID);
    generated_connector_traffic[randomConnectorID] = 2;
    yellowCount++;
  }

  // set yellow traffic on random connectors
  let redCount = 0;
  while (redCount < totalRed) {
    const randomConnectorID = get_random_connector_id();

    // skips if random ID already in yellow/red
    if (yellowID.includes(randomConnectorID) || redID.includes(randomConnectorID)) continue;

    // add connector_id to color
    redID.push(randomConnectorID);
    generated_connector_traffic[randomConnectorID] = 3;
    redCount++;
  }

  return generated_connector_traffic;
}

async function generate_connector_traffic_data(traffic_data) {
  // generate connector traffic approaches:
  // 1. make connection to MySQL DB
  // 2. fetch all connector based on way_id
  // 3. generate connector by using wayID_traffic_data
  //   - get total connector in wayID
  //   - using wayID_traffic_data indicator value, select random connector

  let all_generated_connector_traffic_data = {};

  for (const data of traffic_data) {
    let { connectorIDs, indicator_values } = data;

    // turn values from string into js array first
    connectorIDs = connectorIDs.split(",");
    indicator_values = JSON.parse(indicator_values);

    const generated_connector_traffic_data = generate_random_connector_traffic(connectorIDs, indicator_values);
    all_generated_connector_traffic_data = { ...all_generated_connector_traffic_data, ...generated_connector_traffic_data };
  }

  return all_generated_connector_traffic_data;
}

module.exports = generate_connector_traffic_data;
