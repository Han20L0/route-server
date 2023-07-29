const app = require("../app");
const calculate_route = require("./calculate_route");
const generate_data = require("./data_generation");
const traffic_request = require("./traffic_request");
const traffic_overview = require("./traffic_overview");
const accessible_request = require("./accessibles");
const accessible_overview = require("./accessibles_overview");

function set_express_routes() {
  /**
   * @openapi
   * /route:
   *  get:
   *     tags:
   *     - Route
   *     summary: Get route between two coordinates
   *     parameters:
   *      - name: coordinates
   *        in: query
   *        description: source and target coordinates [lat,lon] seperated by semicolon(;)
   *        type: "string"
   *        example: "-6.972689,107.638447;-6.971672,107.639164"
   *        required: true
   *      - name: vehicle
   *        type: "number"
   *        in: query
   *        description: "vehicle type: 0 for motorcycle, 1 for car"
   *        required: true
   *        example: 0
   *      - name: priorities
   *        type: "string"
   *        in: query
   *        description: "list of 4 number combination of priorities list of 1-4"
   *        required: true
   *        example: "1423"
   *     responses:
   *       200:
   *        description: OK
   *       400:
   *        description: Invalid Parameter(s)
   */
  app.get("/route", calculate_route);

  /**
   * @openapi
   * '/generate-data':
   *  get:
   *     tags:
   *     - Setup
   *     summary: Perform Data (traffic, weather) generation
   *     parameters:
   *      - name: realtime
   *        in: query
   *        type: boolean
   *        description: generate data using current time data if true
   *        required: true
   *        example: true
   *     responses:
   *       200:
   *         description: OK, traffic regenerated
   *       400:
   *         description: Invalid parameter(s)
   */

  app.get("/generate-data", generate_data);

  /**
   * @openapi
   * '/traffic':
   *  get:
   *     tags:
   *     - Debug
   *     summary: Get all Traffic information
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Invalid parameter(s)
   */
  app.get("/traffic", traffic_request);
  app.get("/traffic-overview", traffic_overview);

  /**
   * @openapi
   * '/accessible/{type}':
   *  get:
   *     tags:
   *     - Debug
   *     summary: view all accessible road for selected vehicle. this may cast error because too many data in response
   *     parameters:
   *      - name: type
   *        in: path
   *        type: integer
   *        description: motor or car
   *        required: true
   *        example: motor
   *     responses:
   *       200:
   *         description: OK
   *       400:
   *         description: Invalid parameter(s)
   */
  app.get("/accessible/:type", accessible_request);
  app.get("/accessible-overview/:type", accessible_overview);
}

module.exports = set_express_routes;
