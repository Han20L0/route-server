const { mysql_query } = require("../mysql");

async function store_connector_traffic(generated_connector_traffic_data) {
  // approaches:
  // 1. make a connection with MySQL DB
  // 2. store all data with parameter connector_id and indicator_value
  // 3. close connection

  // 2. store all data with parameter connector_id and indicator_value
  for (const connector_id in generated_connector_traffic_data) {
    const indicator_value = generated_connector_traffic_data[connector_id];
    const query = `INSERT INTO tb_generated_traffics (connector_id,indicator_value) VALUES (${parseInt(connector_id)}, ${indicator_value})`;

    await mysql_query(query);
  }

  console.log("storing completed, well done!");
}

module.exports = store_connector_traffic;
