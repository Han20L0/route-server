function validate_latitude(coordinate_lat, res, name) {
  if (coordinate_lat < -90 || coordinate_lat > 90) {
    res.status(400).json({
      message: `${name} coordinate not valid`,
    });
  }
}

function validate_longitude(coordinate_lon, res, name) {
  if (coordinate_lon < -180 || coordinate_lon > 180) {
    res.status(400).json({
      message: `${name} coordinate not valid`,
    });
  }
}

function validate_traffic_request_params(params, res) {
  const { north, east, west, south } = params;

  validate_latitude(north, res, "north");
  validate_latitude(south, res, "south");
  validate_longitude(west, res, "west");
  validate_longitude(east, res, "east");

  return { north, east, west, south };
}

module.exports = validate_traffic_request_params;
