const app = require("./app");

const generate_traffic = require("./traffic_generation");
const set_express_routes = require("./routes");
const { connect_db, end_db } = require("./mysql");

const port = 3000;

app.listen(port, async () => {
  connect_db();

  // await generate_traffic();
  set_express_routes();

  console.log(`server ready at port ${port}!`);
});

process.on("exit", () => {
  end_db();
});
