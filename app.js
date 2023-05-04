const express = require('express');

//const for call validating query function
const valid_coordinates = require("./Request/Validating/Coordinates");
const valid_vehicle = require("./Request/Validating/Vehicle");
const valid_linestrings = require("./Request/Validating/Linestrings");
const valid_priorities = require("./Request/Validating/Priorities");

//const for call searching nearest node function
const searching_nodes = require("./dataset/nearest_search/searching_nearest_node");


const app = express();


app.use("/route",(req, res)=>{
    
    //Tske all argumnet
    const params = req.query;
    const {coordinates,vehicle,priorities,linestring} = params;

    //validating Process
    const coordinates_input = valid_coordinates.validating_coordinates(res, coordinates);
    const vehicle_input = valid_vehicle.validating_vehicle(res, vehicle);
    const priorities_input = valid_priorities.validating_priorities(res, priorities);
    const linestring_input = valid_linestrings.validating_linestring(res, linestring);
   
    //Respons Server
    res.status(200).json({
        coordinates_source: {
            lat: coordinates_input[0][0],
            lon: coordinates_input[0][1]
        },
        coordinates_target: {
            lat: coordinates_input[1][0],
            lon: coordinates_input[1][1]
        },
        vehicle: vehicle_input,
        priorities: priorities_input,
        linestring: linestring_input
    });

    //searching nearest node
    const lat_input = coordinates_input[0][0];
    console.log(lat_input);
    const lon_input = coordinates_input[0][1];
    console.log(lon_input);
    const searching_input = searching_nodes.seaching_nearest_node(lat_input,lon_input);
});

module.exports = app;