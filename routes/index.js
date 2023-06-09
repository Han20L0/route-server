const app = require("../app");
const calculate_route = require("./calculate_route");
const traffic_request = require("./traffic_request");

function set_express_routes() {
  app.use("/route", calculate_route);
  app.use("/traffic", traffic_request);
}

module.exports = set_express_routes;
