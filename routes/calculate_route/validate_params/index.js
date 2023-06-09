const valid_coordinates = require("./Coordinates");
const valid_vehicle = require("./Vehicle");
const valid_priorities = require("./Priorities");

//const for call validating query function
function validate_request_params(res, params) {
  const { coordinates, vehicle, priorities } = params;

  //validating Process
  const coordinates_input = valid_coordinates.validating_coordinates(res, coordinates);
  const vehicle_input = valid_vehicle.validating_vehicle(res, vehicle);
  const priorities_input = valid_priorities.validating_priorities(res, priorities);

  return { coordinates_input, vehicle_input, priorities_input };
}

module.exports = validate_request_params;
