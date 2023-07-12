const app = require("../app");
const calculate_route = require("./calculate_route");
const generate_data = require("./data_generation");
const traffic_request = require("./traffic_request");
const accessible_request = require("./accessibles/accessible_request");

const set_accessible_status = require("./accessibles/set_accessibles");

let view_accessibles = {
  status: false,

  // 0 for motorcycle, 1 for car
  type: 0,
};

const set_accessibles = (status, type) => {
  view_accessibles = {
    status,
    type,
  };
};

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
   *        example: "-6.975219, 107.635548;-6.977775, 107.634733"
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
   *        description: "list of 5 number combination of priorities list of 1-5"
   *        required: true
   *        example: "12534"
   *     responses:
   *       200:
   *        description: OK
   *       400:
   *        description: Invalid Parameter(s)
   */
  app.use("/route", calculate_route);

  /**
   * @openapi
   * '/traffic':
   *  get:
   *     tags:
   *     - Traffic
   *     summary: Get Trafiic information within bounds
   *     parameters:
   *      - name: x
   *        in: query
   *        description: X tile number
   *        required: true
   *        example: 26180
   *      - name: y
   *        in: query
   *        description: Y tile number
   *        required: true
   *        example: 17020
   *      - name: zoom
   *        in: query
   *        description: zoom level
   *        required: true
   *        example: 15
   *     responses:
   *       200:
   *         description: Success
   *       400:
   *         description: Invalid parameter(s)
   */
  app.use("/traffic", (req, res) => {
    if (view_accessibles.status) {
      accessible_request(req, res, view_accessibles.type);
    } else {
      traffic_request(req, res);
    }
  });

  /**
   * @openapi
   * '/generate-data':
   *  get:
   *     tags:
   *     - Traffic
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

  app.use("/generate-data", generate_data);

  /**
   * @openapi
   * '/view-accessible':
   *  get:
   *     tags:
   *     - Debug
   *     summary: view all accessible road for selected vehicle, but disabling traffic view
   *     parameters:
   *      - name: status
   *        in: query
   *        type: integer
   *        description: 0 for false, 1 for true
   *        required: true
   *        example: 1
   *      - name: vehicle_type
   *        in: query
   *        type: integer
   *        description: 0 for motorcycle, 1 for car
   *        required: true
   *        example: 0
   *     responses:
   *       200:
   *         description: OK
   *       400:
   *         description: Invalid parameter(s)
   */
  app.use("/view-accessible", (req, res) => {
    set_accessible_status(req, res, set_accessibles);
  });
}

module.exports = set_express_routes;
