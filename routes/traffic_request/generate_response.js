function generate_geometries_response(traffic_data) {
  const responseGeometries = {
    light: [],
    moderate: [],
    heavy: [],
  };

  for (const traffic of traffic_data) {
    const { id, geometry, indicator_value, angle, heading } = traffic;

    if (indicator_value === 1) responseGeometries.light.push([geometry, angle, heading]);
    else if (indicator_value === 2) responseGeometries.moderate.push([geometry, angle, heading]);
    else if (indicator_value === 3) responseGeometries.heavy.push([geometry, angle, heading]);
  }

  return responseGeometries;
}

module.exports = generate_geometries_response;
