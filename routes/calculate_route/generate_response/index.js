const generate_overview = require("./overview");
const generate_steps = require("./steps");

function set_route_response(paths, intersections, connectors) {
  // purpose: generate response of listed properties below:
  // - overview information: distance\duration, geometries
  // - geometries list with each traffic
  // - steps

  // approaches:
  // 1. get each intersections' connectorlist
  // 2. get every connector data including: distance, duration, traffic, geometry
  const overview = generate_overview(paths, intersections, connectors);
  const steps = generate_steps(paths, intersections, connectors);

  return {
    overview,
    steps,
  };
}

module.exports = set_route_response;
