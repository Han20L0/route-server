function validate_realtime(realtime, res) {
  realtime = realtime.toLowerCase();

  let isValid = false;

  if (realtime === "true" || realtime === "false") isValid = true;

  if (!isValid) {
    res.status(400).json({
      message: `realtime parameter is not valid`,
    });
  }

  return realtime === "true";
}

function validate_traffic_generation_request_params(params, res) {
  let { realtime } = params;

  realtime = validate_realtime(realtime, res);

  return { realtime };
}

module.exports = validate_traffic_generation_request_params;
