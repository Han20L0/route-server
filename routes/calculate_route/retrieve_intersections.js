const { mysql_query } = require("../../mysql");

async function get_all_intersection_within_bounds(bounds) {
  // this function performs MySQL query to retrieve:
  // - id, source_node_id, target_node_id, via_way_id from tb_intersections
  // - distance, duration from tb_distance
  // - geometry from tb_geometry
  // - connector_id_list from tb_intersection_connector
  // this query using tb_nodes information to restrict outcome intersections within bounds
  // the outcome will be array of intersection with informations above

  const { west, east, south, north } = bounds;

  //   SELECT tb_intersections.id, tb_intersections.via_way_id,
  //        IF(tb_accessible_ways.way_id IS NULL, FALSE, TRUE) as is_accessible
  // FROM tb_intersections
  // LEFT JOIN tb_accessible_ways ON (tb_intersections.via_way_id = tb_accessible_ways.way_id);

  //   SELECT id,source_node_id, target_node_id, via_way_id, distance, duration, connector_id_list, IF(tb_accessible_ways.way_id IS NULL, FALSE, TRUE) as is_accessible
  //   FROM (SELECT id,source_node_id, target_node_id, via_way_id, distance, duration, connector_id_list FROM (SELECT DISTINCT(intersection.id), intersection.source_node_id, intersection.target_node_id, intersection.via_way_id, nodes.lat, nodes.lon, distances.distance, distances.duration, connectors.connector_id_list FROM tb_nodes AS nodes, tb_intersections AS intersection, tb_distance AS distances, tb_intersection_connector AS connectors WHERE nodes.id = intersection.source_node_id AND distances.inter_id
  // = intersection.id AND connectors.inter_id = intersection.id AND nodes.lat < -6.95 AND nodes.lat > -7 AND nodes.lon > 107.6 AND nodes.lon < 107.65) as result) as result2
  //   LEFT JOIN tb_accessible_ways ON (via_way_id = tb_accessible_ways.way_id);

  // SELECT id,source_node_id, target_node_id, via_way_id, distance, duration, connector_id_list, IF(tb_accessible_ways.way_id IS NULL, FALSE, TRUE) as is_accessible
  // FROM (
  //     SELECT DISTINCT(intersection.id), intersection.source_node_id, intersection.target_node_id, intersection.via_way_id, nodes.lat, nodes.lon, distances.distance, distances.duration, connectors.connector_id_list
  //     FROM tb_nodes AS nodes, tb_intersections AS intersection, tb_distance AS distances, tb_intersection_connector AS connectors
  //     WHERE nodes.id = intersection.source_node_id AND distances.inter_id = intersection.id AND connectors.inter_id = intersection.id
  //     AND nodes.lat < -6.95 AND nodes.lat > -7 AND nodes.lon > 107.6 AND nodes.lon < 107.65) as result
  //  LEFT JOIN tb_accessible_ways ON (via_way_id = tb_accessible_ways.way_id);

  const selectColumn = "id,source_node_id, target_node_id, via_way_id, distance, duration, connector_id_list";
  const selectColumnInner =
    "DISTINCT(intersection.id), intersection.source_node_id, intersection.target_node_id, intersection.via_way_id, nodes.lat, nodes.lon, distances.distance, distances.duration, connectors.connector_id_list";
  const tablesQuery = "tb_nodes AS nodes, tb_intersections AS intersection, tb_distance AS distances, tb_intersection_connector AS connectors";
  const idConstraints = "nodes.id = intersection.source_node_id AND distances.inter_id = intersection.id AND connectors.inter_id = intersection.id";
  const boundsConstraints = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;

  const query = `SELECT ${selectColumn} FROM (
                  SELECT ${selectColumnInner} 
                  FROM ${tablesQuery}
                  WHERE ${idConstraints} 
                  AND ${boundsConstraints}
                ) as result;`;
  console.log(query);

  const intersection_list = await mysql_query(query);

  return intersection_list;
}

async function get_all_accessible_roads_within_bounds(bounds) {
  // this function performs MySQL query to retrieve:
  // -  way_id from tb_accessible_ways
  // this query using tb_intersection to get way_id on tb_accessible_ways
  // this query using tb_nodes to restrict outcome within bounds
  // the outcome will be an array containing accessible way_id(s)

  const { west, east, south, north } = bounds;

  const selectColumn = "via_way_id";
  const selectColumnInner = "DISTINCT(intersection.via_way_id), intersection.source_node_id, nodes.lat, nodes.lon";
  const tablesQuery = "tb_nodes AS nodes, tb_intersections AS intersection, tb_accessible_ways AS accessibles";
  const idConstraints = "nodes.id = intersection.source_node_id AND accessibles.way_id = intersection.via_way_id";
  const boundsConstraints = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;

  const query = `SELECT ${selectColumn} FROM (SELECT ${selectColumnInner} FROM ${tablesQuery} WHERE ${idConstraints} AND ${boundsConstraints}) as result;`;
  console.log(query);

  const accessible_ways = await mysql_query(query);

  return accessible_ways;
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

  const traffic_lights = await new mysql_query(query);

  return traffic_lights;
}

async function get_all_generated_traffic_within_bounds(bounds) {
  // this function performs MySQL query to retrieve:
  // connector_id, indicator_value from tb_generated_connector_traffic
  // geometry from tb_connector
  // this query using tb_connector to get connector_id on tb_generated_connector_traffic
  // this query using tn_nodes to get source_node_id on tb_connector and to restrict outcome within bounds

  const { west, east, south, north } = bounds;

  const selectColumn = "connector_id, indicator_value, geometry";
  const selectColumnInner = "DISTINCT(traffic.connector_id), traffic.indicator_value, connectors.geometry";
  const tablesQuery = "tb_nodes AS nodes, tb_generated_connector_traffic AS traffic, tb_connector as connectors";
  const idConstraints = "traffic.connector_id = connectors.id AND connectors.source_node_id = nodes.id";
  const boundsConstraints = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;

  const query = `SELECT ${selectColumn} FROM (SELECT ${selectColumnInner} FROM ${tablesQuery} WHERE ${idConstraints} AND ${boundsConstraints}) as result;`;

  const generated_traffics = await mysql_query(query);

  return generated_traffics;
}

async function retrieve_interection_information(bounds) {
  // retrieve all intersection nodes with bounds (west,east,north,south) and join with data from other tables:
  //  - get id, source_node_id, target_node_id, via_way_id from tb_intersection
  //  - get
  // approaches:
  // 1. destruct bounds
  // 3. perform MySQL query:
  // - only get source_node_id column
  // - restrict by bounds
  // 5. return results

  // 2. perform MySQL query:
  //  - intersection (with data from other tables):
  //    - id
  //    - intersection_connectors
  //    - distance and duration
  //    - way_quality (???)
  //    - geometry
  //  - generated traffic (with data from other tables):
  //    - connector_id
  //    - indicator_value
  //    - geometry
  //  - traffic light node IDs
  //  - accessible ways

  const intersections = await get_all_intersection_within_bounds(bounds);
  // const accessible_ways = await get_all_accessible_roads_within_bounds(bounds);
  // const traffic_light_nodes = await get_all_traffic_light_nodes_within_bounds(bounds);
  // const traffics = await get_all_generated_traffic_within_bounds(bounds);

  // 5. return results
  // return results;
}

module.exports = retrieve_interection_information;
