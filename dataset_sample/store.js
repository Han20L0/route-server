const mysql = require("mysql");
const store_source = require("./source/store_source");
const store_nodes_derivatives = require("./node/store_nodes_derivatives");
const store_ways_derivatives = require("./ways/store_ways_derivatives");
const store_intersections = require("./intersection/store_intersections");
const store_traffic = require("./traffic/store_traffic");
const store_weathers = require("./weather/store_weather");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "sample_route_db",
});

async function store() {
  // connect DB
  connection.connect(async () => {
    console.log("DB connected");

    await store_source(connection);
    // await store_ways_derivatives(connection);
    await store_intersections(connection);
    // await store_traffic(connection);
    // await store_weathers(connection);

    connection.end();
  });
}

store();
