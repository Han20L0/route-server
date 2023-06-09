function validating_vehicle(res, vehicle) {
  //Check if the vehicle is defined
  if (vehicle === undefined) {
    res.status(400).json({
      message: "vehicle is undefined",
    });
  }

  //Checking there is no other number between 1 or 0
  if (/^[01]$/.test(vehicle)) {
    return parseInt(vehicle, 10);
  } else {
    return res.status(400).json({
      message: "vehicle is not valid. It should be either 0 or 1.",
    });
  }
}

module.exports = { validating_vehicle };
