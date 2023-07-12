const { mysql_query } = require("../../mysql");
const MERCATOR = require("../../utils/mercator");

function generate_vehicle_constraint(vehicle_type) {
  if (vehicle_type === "motor") {
    return "is_accessible_motor = 1";
  }
  if (vehicle_type === "car") {
    return "is_accessible_car = 1";
  }
}

async function get_all_intersection_within_bounds(bounds, vehicle_type) {
  // this function performs MySQL query to retrieve:
  // - id, source_node_id, target_node_id, via_way_id from tb_intersections
  // - distance, duration from tb_distance
  // - geometry from tb_geometry
  // - connector_id_list from tb_intersection_connector
  // this query using tb_nodes information to restrict outcome intersections within bounds
  // the outcome will be array of intersection with informations above

  const { west, east, south, north } = bounds;

  const selectColumnInner =
    "DISTINCT(intersection.id), intersection.source_node_id, intersection.target_node_id, intersection.via_way_id, intersection.connector_list, intersection.continue_straight_id";
  const tablesQuery = "tb_nodes AS nodes, tb_intersections AS intersection";
  const idConstraints = "nodes.id = intersection.source_node_id";
  const boundsConstraints = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;
  const vehicleConstraints = generate_vehicle_constraint(vehicle_type);

  const query = `SELECT ${selectColumnInner} 
                  FROM ${tablesQuery}
                  WHERE ${idConstraints} 
                  AND ${boundsConstraints}
                  AND intersection.${vehicleConstraints}`;
  const intersection_list = await mysql_query(query);

  // turn list into objects
  let intersection_list_object = {};
  for (const intersection of intersection_list) {
    const { id } = intersection;

    delete intersection.id;
    intersection_list_object[id] = intersection;
  }

  return intersection_list_object;
}

async function get_all_traffic_light_nodes_within_bounds(bounds) {
  // this function performs MySQL query to retrieve:
  // node_id from tb_traffic_light_nodes
  // this query using tb_nodes to get node_id on tb_traffic_light_nodes and to restrict outcome within bounds
  // the outcome will be an array containing traffic_light_node_id(s)

  const { west, east, south, north } = bounds;

  const selectColumn = "node_id";
  const tablesQuery = "tb_nodes AS nodes, tb_traffic_light_nodes as traffic_light";
  const idConstraints = "nodes.id = traffic_light.node_id";
  const boundsConstraints = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;

  const query = `SELECT ${selectColumn} FROM ${tablesQuery} WHERE ${idConstraints} AND ${boundsConstraints};`;

  const traffic_lights = await mysql_query(query);

  return traffic_lights;
}

async function get_all_connector_within_bounds(bounds, vehicle_type) {
  // this function performs MySQL query to retrieve:
  // connector_id, indicator_value from tb_generated_connector_traffic
  // geometry from tb_connector
  // this query using tb_connector to get connector_id on tb_generated_connector_traffic
  // this query using tn_nodes to get source_node_id on tb_connector and to restrict outcome within bounds

  const { west, east, south, north } = bounds;

  // SELECT DISTINCT(connectors.id), connectors.geometry, connectors.is_accessible, connectors.heading, tb_current_traffics.indicator_value as current_traffic
  // FROM tb_connector as connectors
  // LEFT JOIN tb_current_traffics ON connectors.id = tb_current_traffics.connector_id
  // WHERE connectors.startTileX >= 0 AND connectors.startTileY >= 0 AND connectors.endTileX <= 50000 AND connectors.endTileY <= 50000;

  const query = `
  SELECT DISTINCT(connectors.id), connectors.source_lat, connectors.source_lon, connectors.source_node_id, connectors.target_node_id, connectors.via_way_id, connectors.geometry, connectors.is_accessible_car, is_accessible_motor, connectors.heading, connectors.distance, connectors.duration, connectors.n_distance, connectors.n_duration, traffic.indicator_value as current_traffic, weathers.normalized_rating as condition_rating
  FROM tb_connector as connectors
  LEFT JOIN tb_current_traffics traffic ON connectors.id = traffic.connector_id
  LEFT JOIN tb_current_weather weathers ON connectors.source_lon >= weathers.lon - 0.0049 AND connectors.source_lat >= weathers.lat - 0.0049 AND connectors.source_lon <= weathers.lon + 0.0049 AND connectors.source_lat <= connectors.source_lat >= weathers.lat + 0.0049
  WHERE connectors.source_lon >= ${west} AND connectors.source_lat >= ${south} AND connectors.source_lon <= ${east} AND connectors.source_lat <= ${north}
  AND connectors.${generate_vehicle_constraint(vehicle_type)};
  `;

  const connectors = await mysql_query(query);

  // turn list into objects
  let connectors_object = {};
  for (const connector of connectors) {
    const { id, source_node_id, target_node_id, via_way_id } = connector;

    connectors_object[`${id},${source_node_id},${target_node_id},${via_way_id}`] = connector;
  }

  return connectors_object;
}

async function retrieve_interection_information(bounds, vehicle_type) {
  // retrieve all intersection nodes with bounds (west,east,north,south) and join with data from other tables:
  // approaches:
  // 1. destruct bounds
  // 3. perform MySQL query:
  // - only get source_node_id column
  // - restrict by bounds
  // 5. return results

  // 2. perform MySQL query:
  //  - intersection (with distance, duration, connector_list)
  //  - connector (with current traffic, accessible)
  //  - traffic light node IDs
  //  - current weather

  const intersections = await get_all_intersection_within_bounds(bounds, vehicle_type);
  const connectors = await get_all_connector_within_bounds(bounds, vehicle_type);
  const traffic_light_nodes = await get_all_traffic_light_nodes_within_bounds(bounds);

  // 5. return results
  return { intersections, connectors, traffic_light_nodes };
}

module.exports = retrieve_interection_information;
