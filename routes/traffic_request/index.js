const generate_geometries_response = require("./generate_response");
const get_traffic_within_bounds = require("./retrieve_traffic");
const validate_traffic_request_params = require("./validate_params");
const MERCATOR = require("../../utils/mercator");

async function cache_traffic() {}

async function traffic_request(req, res) {
  console.log("request coming");
  // Approaches:
  // 1. validate request bounds (n,e,w,s) -> changed into tile coordinate (x,y)
  // 1.5. change tile coordinate into bounds (n,e,w,s)
  // 2. get connector and it's generated_traffic_connector data within bounds
  // 3. generate response with geometry and respective indicator values
  // 4. return response

  // 1. validate request bounds (n,e,w,s)
  const { query } = req;

  const tile = validate_traffic_request_params(query, res);

  // 2. get connector (id and geomtry) and it's generated_traffic_connector data within bounds
  const startTime = performance.now();
  const queue = get_traffic_within_bounds(tile);
  const traffic_data = await queue;
  const traffictime = performance.now();

  console.log("took time for fetch DB: ", traffictime - startTime);

  // 3. generate response of array of 3 [[light_traffic], [moderate_traffic], [heavy_traffic]]
  const geometries_response = generate_geometries_response(traffic_data);
  const geometryTime = performance.now();

  console.log("took time for generate geometry: ", geometryTime - traffictime);
  // add_cache(tile);

  return res.json({
    geometries_response,
  });
}

module.exports = traffic_request;
