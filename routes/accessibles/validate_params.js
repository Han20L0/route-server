function validate_tile_coordinate(tileCoordinate, name, res) {
  if (isNaN(tileCoordinate)) {
    res.status(400).json({
      message: `${name} coordinate not valid`,
    });
  }
}

function validate_traffic_request_params(params, res) {
  const { x, y } = params;

  validate_tile_coordinate(x, "tile x", res);
  validate_tile_coordinate(y, "tile y", res);

  return { x, y, z: 15 };
}

module.exports = validate_traffic_request_params;
