const validate_view_accessible_params = require("./validate_params");

async function set_accessible_status(req, res, set_accessibles) {
  const { status, vehicle_type } = validate_view_accessible_params(req.query, res);

  if (typeof status === NaN) return;
  if (typeof vehicle_type === NaN) return;

  set_accessibles(status, vehicle_type);

  res.sendStatus(200);
}

module.exports = set_accessible_status;
