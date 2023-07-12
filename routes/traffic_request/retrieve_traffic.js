const { mysql_query } = require("../../mysql");
const MERCATOR = require("../../utils/mercator");

const caches = {};

async function get_traffic_within_bounds(tile) {
  // approaches:
  // 1. retrieve bounds
  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  // 1. retrieve bounds
  const { x, y, z } = tile;

  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  const id = `${x}|${y}|${z}`;

  const bounds = MERCATOR.getTileBounds(tile);
  const { south, north, east, west } = bounds;

  if (caches[id]) return caches[id];

  const restrictQuery = `connectors.source_lat <= ${north} AND connectors.source_lon >= ${east} AND connectors.source_lat >= ${south} AND connectors.source_lon <= ${west}`;
  const innerQuery = `SELECT DISTINCT(connectors.id), connectors.geometry, connectors.heading, connectors.angle, gtraffics.indicator_value
  FROM tb_connector AS connectors, tb_current_traffics AS gtraffics
  WHERE connectors.id = gtraffics.connector_id
  AND ${restrictQuery}`;

  const query = `SELECT id, geometry, indicator_value, heading, angle from (${innerQuery}) as t;`;

  const result = await mysql_query(query);

  caches[id] = result;

  return result;
}

module.exports = get_traffic_within_bounds;
