const { mysql_query } = require("../../mysql");

async function get_traffic_within_bounds(type) {
  // approaches:
  // 1. retrieve bounds
  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  // 2. perform a query with mysql
  //  - search connectors within bounds using tb_nodes table
  //  - get connectors' id and geometry
  //  - with connectors id, search generated_traffic_data with it

  let accessibleQuery;
  if (type === "motor") {
    accessibleQuery = "is_accessible_motor = 1";
  }

  if (type === "car") {
    accessibleQuery = "is_accessible_car = 1";
  }

  const query = `SELECT id, geometry, angle, heading FROM tb_connector AS connectors WHERE ${accessibleQuery};`;
  const result = await mysql_query(query);

  return result;
}

module.exports = get_traffic_within_bounds;
