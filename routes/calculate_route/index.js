const validate_request_params = require("./validate_params");
const set_bounds = require("./bounding");
const { search_nearby_nodes, search_nearby_nodes_by_intersection } = require("./nearby_intersection");
const retrieve_interection_information = require("./retrieve_intersections");
const connect_intersection_with_connectors = require("./add_values");
const weight_intersection = require("./weight_intersections");
const create_graph = require("./graph");
const search_shortest_path = require("./shortest_path");

async function calculate_route(req, res) {
  // calculating route approaches:
  // 1. validate request (source\target coordinates, vehicle type, priority list and linestring)
  // 2. set bounds (w,e,s,n) between source\target coordinates
  // 3. get 2 nearby intersection nodes to source/target coordinates
  // 4. retrieve all information for weighting within bounds, including:
  //  - intersection (with data from other tables):
  //    - id
  //    - intersection_connectors
  //    - distance and duration
  //    - traffic_light_on_end
  //    - is_accessible_by_car
  //    - way_quality
  //  - connectors (with data from other tables):
  //    - id
  //    - generated_traffic_indicator

  // 5. weighting process
  // 6. Dijkstra's algorithm
  // 7.

  // 1. validate request (source\target coordinates, vehicle type, priority list and linestring)
  const { query } = req;
  const { coordinates_input, vehicle_input, priorities_input } = validate_request_params(res, query);

  const [source_coordinates, target_coordinates] = coordinates_input;

  // 2. set bounds (w,e,s,n) between source\target coordinates
  const boundings = set_bounds(source_coordinates, target_coordinates);

  // 3. get nearby access points (source and target)
  // 3. get 2 nearby intersection nodes to source/target coordinates
  // 3b. get its nearby connector too
  let nearbySourceNodeIDs = await search_nearby_nodes(source_coordinates, boundings);
  let nearbyTargetNodeIDs = await search_nearby_nodes(target_coordinates, boundings);

  console.log(nearbySourceNodeIDs[0].id, nearbyTargetNodeIDs[0].id);

  // 4. retrieve all information for weighting within bounds, including:
  //  - intersection (with data from other tables):
  //    - id
  //    - intersection_connectors
  //    - distance and duration
  //  - connectors (with data from other tables):
  //    - id
  //    - traffic indicator
  //    - is_accessible_by_car
  //    - current weather
  //  - traffic light node IDs
  const { intersections, connectors, traffic_light_nodes } = await retrieve_interection_information(boundings, vehicle_input);

  console.log(`loaded total intersections of ${Object.keys(intersections).length}`);

  // renew nearby node ID
  nearbySourceNodeIDs = search_nearby_nodes_by_intersection(intersections, nearbySourceNodeIDs);
  nearbyTargetNodeIDs = search_nearby_nodes_by_intersection(intersections, nearbyTargetNodeIDs);

  console.log(nearbySourceNodeIDs, nearbyTargetNodeIDs);

  // 5. add intersections values that based from connectors. like traffic and condition
  const valued_intersection = connect_intersection_with_connectors(intersections, connectors);

  // 6. weighting
  const { multipliers, costed_intersections } = weight_intersection(valued_intersection, priorities_input);

  // 7. create graph
  const graph = create_graph(costed_intersections);

  // 7. dijkstra's algorithm
  search_shortest_path(graph, nearbySourceNodeIDs, nearbyTargetNodeIDs);
}

module.exports = calculate_route;
