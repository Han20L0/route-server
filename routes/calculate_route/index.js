const validate_request_params = require("./validate_params");
const set_bounds = require("./bounding");
const { search_nearby_access_points } = require("./nearby_intersection");
const retrieve_interection_information = require("./retrieve_intersections");
const { set_connectors_cost, set_intersection_cost } = require("./add_values");
const modify_entries = require("./modify_entries");
const set_multipliers = require("./multipliers");
const search_shortest_path = require("./shortest_path");
const set_route_response = require("./generate_response");
const Analyzer = require("./analytics");

async function calculate_route(req, res) {
  const analyzer = new Analyzer();

  // calculating route approaches:
  // 1. validate request (source\target coordinates, vehicle type, priority list)
  // 2. set bounds (w,e,s,n) between source\target coordinates
  // 3. get 2 nearby intersection nodes to source/target coordinates
  // 4. retrieve all information for weighting within bounds, including:
  //  - intersection
  //  - connectors
  // 5. weighting process
  // 6. Dijkstra's algorithm
  // 7.

  // 1. validate request (source\target coordinates, vehicle type, priority list)
  const { query } = req;
  const { coordinates_input, vehicle_input, priorities_input } = validate_request_params(res, query);
  analyzer.markMemory();

  const [source_coordinates, target_coordinates] = coordinates_input;

  // 2. set bounds (w,e,s,n) between source\target coordinates
  const boundings = set_bounds(source_coordinates, target_coordinates);
  analyzer.markMemory();

  if (!boundings.inBounds) {
    const analyticsReport = analyzer.createReport();
    return res.status(400).json({ code: "error", error: "Out of bounds", analyticsReport });
  }

  // 3. retrieve all information for weighting within bounds, including:
  //  - intersections
  //  - connectors
  const { intersections, connectors } = await retrieve_interection_information(boundings, vehicle_input);
  analyzer.markMemory();
  analyzer.markQuery();

  analyzer.intersectionCount = Object.keys(intersections).length;
  analyzer.connectorCount = Object.keys(connectors).length;

  // 4. get nearest coordinate to road, and nearest connector
  const start_access_points = await search_nearby_access_points(source_coordinates, boundings, connectors, intersections);
  const finish_access_points = await search_nearby_access_points(target_coordinates, boundings, connectors, intersections);
  analyzer.markMemory();

  if (!start_access_points.location_found || !finish_access_points.location_found) {
    const analyticsReport = analyzer.createReport();
    return res.status(400).json({ code: "error", error: "access points not found", analyticsReport });
  }

  console.log(start_access_points, finish_access_points);

  // 5. modify connectors and intersection by inserting the nearest coordinate into connector entries and intersection entries
  const { modified_connectors, modified_intersections } = modify_entries(start_access_points, finish_access_points, connectors, intersections);
  analyzer.markMemory();

  // 6. add intersections values that based from connectors. like traffic and condition
  const multipliers = set_multipliers(priorities_input);
  const costed_connectors = set_connectors_cost(modified_connectors, multipliers);
  const costed_intersections = set_intersection_cost(modified_intersections, costed_connectors, multipliers);
  analyzer.markMemory();

  // 7. dijkstra's algorithm
  const { path: best_route, found: pathFound, iterationCount } = search_shortest_path(costed_intersections, multipliers);
  analyzer.markMemory();
  analyzer.iterationCount = iterationCount;

  if (!pathFound) {
    const analyticsReport = analyzer.createReport();
    return res.status(400).json({ code: "error", error: "Route not found", analyticsReport });
  }

  // 8. generate geometry for route
  const route_information = set_route_response(best_route, costed_intersections, costed_connectors);
  analyzer.markMemory();

  analyzer.endAnalyze();
  const analyticsReport = analyzer.createReport();

  // 9. return both route and geoemtry response
  return res.status(200).json({ code: "success", route: route_information, analyticsReport });
}

module.exports = calculate_route;
