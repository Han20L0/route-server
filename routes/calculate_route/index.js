const validate_request_params = require("./validate_params");
const set_bounds = require("./bounding");
const search_nearby_intersection_nodes = require("./nearby_intersection");
const retrieve_interection_information = require("./retrieve_intersections");

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
  const { params } = req;
  const { coordinates_input, vehicle_input, priorities_input } = validate_request_params(params, res);

  const [source_coordinates, target_coordinates] = coordinates_input;

  // 2. set bounds (w,e,s,n) between source\target coordinates
  const boundings = set_bounds(source_coordinates, target_coordinates);

  // 3. get 2 nearby intersection nodes to source/target coordinates
  const nearbySourceIntesectionNodeIDs = await search_nearby_intersection_nodes(source_coordinates);
  const nearbyTargetIntesectionNodeIDs = await search_nearby_intersection_nodes(target_coordinates);

  // 4. retrieve all information for weighting within bounds, including:
  //  - intersection (with data from other tables):
  //    - id
  //    - intersection_connectors
  //    - distance and duration
  //    - is_accessible_by_car
  //    - way_quality
  //  - connectors (with data from other tables):
  //    - id
  //    - generated_traffic_indicator
  //  - traffic light node IDs

  const { intersection_data, connector_data } = await retrieve_interection_information(boundings);

  // 5. weighting
  // 6.
}

module.exports = calculate_route;
