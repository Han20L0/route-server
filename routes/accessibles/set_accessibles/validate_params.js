function validate_status_type(status, res) {
  status = parseInt(status);

  let isValid = false;

  if (status === 0 || status === 1) isValid = true;

  if (!isValid) {
    res.status(400).json({
      message: `vehicle type parameter is not valid`,
    });
  }

  return status;
}

function validate_vehicle_type(vehicle_type, res) {
  vehicle_type = parseInt(vehicle_type);

  let isValid = false;

  if (vehicle_type === 0 || vehicle_type === 1) isValid = true;

  if (!isValid) {
    res.status(400).json({
      message: `vehicle type parameter is not valid`,
    });
  }

  return vehicle_type;
}

function validate_view_accessible_params(params, res) {
  let { status, vehicle_type } = params;

  status = validate_status_type(status, res);
  vehicle_type = validate_vehicle_type(vehicle_type, res);

  return { status, vehicle_type };
}

module.exports = validate_view_accessible_params;
