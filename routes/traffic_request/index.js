const generate_geometries_response = require("./generate_response");
const get_all_traffic = require("./retrieve_traffic");

async function traffic_request(req, res) {
  // Approaches:
  // 2. get connector and it's generated_traffic_connector data within bounds
  // 3. generate response with geometry and respective indicator values
  // 4. return response

  // 2. get connector (id and geomtry) and it's generated_traffic_connector data within bounds
  const startTime = performance.now();
  const queue = get_all_traffic();
  const traffic_data = await queue;
  const traffictime = performance.now();

  console.log("took time for fetch DB: ", traffictime - startTime);

  // 3. generate response of array of 3 [[light_traffic], [moderate_traffic], [heavy_traffic]]
  const geometries_response = generate_geometries_response(traffic_data);
  const geometryTime = performance.now();

  console.log("took time for generate geometry: ", geometryTime - traffictime);

  return res.json({
    geometries_response,
  });
}

module.exports = traffic_request;
