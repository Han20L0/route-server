const get_accessible_within_bounds = require("./retrieve_accessibles");
const generate_geometries_response = require("./generate_response");

async function accessible_request(req, res) {
  // Approaches:

  // 1. get requested accessible type
  const accessible_type = req.params.type;

  // 2. get all connector (id and geomtry)
  const startTime = performance.now();
  const queue = get_accessible_within_bounds(accessible_type);
  const accessibles_data = await queue;
  const retrieveTime = performance.now();

  console.log("took time for fetch DB: ", retrieveTime - startTime);

  // 3. generate response of array of 3 [[light_traffic], [moderate_traffic], [heavy_traffic]]
  const geometries_response = generate_geometries_response(accessibles_data);
  const geometryTime = performance.now();

  console.log("took time for generate geometry: ", geometryTime - retrieveTime);

  return res.json({
    geometries_response,
  });
}

module.exports = accessible_request;
