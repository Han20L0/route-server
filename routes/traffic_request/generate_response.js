function generate_geometries_response(traffic_data) {
  const responseGeometries = {
    light: [],
    moderate: [],
    heavy: [],
  };

  for (const traffic of traffic_data) {
    const { id, geometry, indicator_value } = traffic;

    if (indicator_value === 1) responseGeometries.light.push(geometry);
    else if (indicator_value === 2) responseGeometries.moderate.push(geometry);
    else if (indicator_value === 3) responseGeometries.heavy.push(geometry);
  }

  return responseGeometries;
}

module.exports = generate_geometries_response;
