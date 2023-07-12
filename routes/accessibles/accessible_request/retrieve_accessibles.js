const { mysql_query } = require("../../../mysql");
const MERCATOR = require("../../../utils/mercator");

const caches = {};

async function get_traffic_within_bounds(tile, type) {
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

  if (caches[id]) return caches[id];

  let accessibleQuery = "";

  if (type === 0) {
    accessibleQuery = "is_accessible_motor = 1";
  }

  if (type === 1) {
    accessibleQuery = "is_accessible_car = 1";
  }

  const bounds = MERCATOR.getTileBounds(tile);
  const { south, north, east, west } = bounds;

  const restrictQuery = `connectors.source_lat <= ${north} AND connectors.source_lon >= ${east} AND connectors.source_lat >= ${south} AND connectors.source_lon <= ${west}`;
  const query = `SELECT id, geometry, angle, heading FROM tb_connector AS connectors WHERE ${accessibleQuery} AND ${restrictQuery};`;
  const result = await mysql_query(query);

  caches[id] = result;

  return result;
}

module.exports = get_traffic_within_bounds;
