function generate_geometries_response(traffic_data) {
  const responseGeometries = {
    light: [],
    moderate: [],
    heavy: [],
  };

  for (const traffic of traffic_data) {
    const { id, geometry, angle, heading } = traffic;

    responseGeometries.light.push([geometry, angle, heading]);
  }

  return responseGeometries;
}

module.exports = generate_geometries_response;
