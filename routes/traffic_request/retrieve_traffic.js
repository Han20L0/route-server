const { mysql_query } = require("../../mysql");

async function get_all_traffic() {
  // approaches:
  // 1. retrieve bounds
  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  const query = `SELECT DISTINCT(connectors.id), connectors.geometry, connectors.heading, connectors.angle, gtraffics.indicator_value
  FROM tb_connector AS connectors, tb_current_traffics AS gtraffics
  WHERE connectors.id = gtraffics.connector_id
  `;

  const result = await mysql_query(query);

  return result;
}

module.exports = get_all_traffic;
