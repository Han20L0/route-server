const { mysql_query } = require("../../mysql");

async function get_traffic_within_bounds(bounds) {
  // approaches:
  // 1. retrieve bounds
  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  // 1. retrieve bounds
  const { north, east, west, south } = bounds;

  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  const restrictQuery = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon < ${west} AND nodes.lon > ${east}`;
  const innerQuery = `SELECT DISTINCT(connectors.id), connectors.geometry, gtraffics.indicator_value
  FROM tb_nodes AS nodes, tb_connectors AS connectors, tb_generated_traffics AS gtraffics
  WHERE (nodes.id = connectors.source_node_id OR nodes.id = connectors.target_node_id) AND connectors.id = gtraffics.connector_id
  AND ${restrictQuery}`;

  const query = `SELECT id, geometry, indicator_value from (${innerQuery}) as t;`;

  return mysql_query(query);
}

module.exports = get_traffic_within_bounds;
