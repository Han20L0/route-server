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
    "id, source_node_id, intersection.target_node_id, via_way_id, connector_list, source_lat, source_lon, target_lat, target_lon";
  const tablesQuery = "tb_intersections AS intersection";
  const boundsConstraints = `source_lat < ${north} AND source_lat > ${south} AND source_lon > ${west} AND source_lon < ${east}`;
  const vehicleConstraints = generate_vehicle_constraint(vehicle_type);

  const query = `SELECT ${selectColumnInner}
                  FROM ${tablesQuery}
                  WHERE ${boundsConstraints}
                  AND ${vehicleConstraints}`;
  const intersection_list = await mysql_query(query);

  // turn list into objects
  let intersection_list_object = {};
  for (const intersection of intersection_list) {
    const { source_node_id, target_node_id, via_way_id } = intersection;

    delete intersection.id;
    intersection_list_object[`${source_node_id},${target_node_id},${via_way_id}`] = intersection;
  }

  return intersection_list_object;
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

  // const connectors_query = `
  // SELECT DISTINCT(connectors.id), connectors.source_lat, connectors.source_lon, connectors.target_lat, connectors.target_lon, connectors.source_node_id, connectors.target_node_id, connectors.via_way_id, connectors.geometry, connectors.is_accessible_car, is_accessible_motor, connectors.heading, connectors.distance, connectors.duration, weathers.normalized_rating as n_condition
  // FROM tb_connector as connectors
  // LEFT JOIN tb_current_weather weathers ON connectors.source_lon >= weathers.lon - 0.0049 AND connectors.source_lat >= weathers.lat - 0.0049 AND connectors.source_lon <= weathers.lon + 0.0049 AND connectors.source_lat <= connectors.source_lat >= weathers.lat + 0.0049
  // AND connectors.${generate_vehicle_constraint(vehicle_type)};
  // `;

  const connectors_query = `SELECT id, source_lat, source_lon, target_lat, target_lon, source_node_id, target_node_id, via_way_id, geometry, is_accessible_car, is_accessible_motor, heading, distance, duration, neighbour_ids
  FROM tb_connector
  WHERE source_lon >= ${west} AND source_lat >= ${south} AND source_lon <= ${east} AND source_lat <= ${north}
  `;

  const traffics_query = `SELECT connector_id, indicator_value FROM tb_current_traffics`;
  const weather_query = `SELECT lat, lon, normalized_rating from tb_current_weather WHERE (lon >= ${west} OR lon <= ${east}) AND (lat >= ${south} OR lat <= ${north})`;

  const connectors = await mysql_query(connectors_query);
  const traffics = await mysql_query(traffics_query);
  const weathers = await mysql_query(weather_query);

  console.log("connectors loaded");

  function search_weather(lat, lon) {
    for (const weather of weathers) {
      const { lat: w_lat, lon: w_lon, normalized_rating } = weather;

      const vertically = lat >= w_lat - 0.005 && lat <= w_lat + 0.005;
      const horizontally = lon >= w_lon - 0.005 && lon <= w_lon + 0.005;

      if (vertically && horizontally) return normalized_rating;
    }
  }

  // turn traffics into object
  const traffic_object = {};
  for (const traffic of traffics) {
    const { connector_id, indicator_value } = traffic;

    traffic_object[connector_id] = indicator_value;
  }

  // normalizing distance & duration values
  let minDuration = Infinity,
    minDistance = Infinity;
  let maxDuration = 0,
    maxDistance = 0;

  // search min-max value
  for (const connector of connectors) {
    const { distance, duration } = connector;

    if (minDistance > distance) minDistance = distance;
    if (maxDistance < distance) maxDistance = distance;

    if (minDuration > duration) minDuration = duration;
    if (maxDuration < duration) maxDuration = duration;
  }

  const deltaDistance = maxDistance - minDistance;
  const deltaDuration = maxDuration - minDuration;

  // save normalized value
  for (const connector of connectors) {
    let { distance, duration, current_traffic } = connector;
    if (current_traffic === null) current_traffic = 1;

    const normalizedDistance = (distance - minDistance) / deltaDistance;
    const normalizedDuration = (duration - minDuration) / deltaDuration;

    connector.n_distance = normalizedDistance;
    connector.n_duration = normalizedDuration;
    connector.n_traffic = (current_traffic - 1) / 2 || 0;
  }

  // turn list into objects
  let connectors_object = {};
  for (const connector of connectors) {
    const { id, source_node_id, target_node_id, source_lat, source_lon } = connector;
    connector.traffic = traffic_object[id] || 1;
    connector.n_condition = search_weather(source_lat, source_lon);
    connectors_object[`${source_node_id},${target_node_id}`] = connector;
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

  // 5. return results
  return { intersections, connectors };
}

module.exports = retrieve_interection_information;
