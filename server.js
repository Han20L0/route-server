const app = require("./app");

const set_express_routes = require("./routes");
const { connect_db, end_db } = require("./mysql");
const swaggerDocs = require("./docs/swagger");

const port = 3000;

app.listen(port, async () => {
  connect_db();
  set_express_routes();

  swaggerDocs(app);
  console.log(`server ready at port ${port}!`);
});

process.on("exit", () => {
  end_db();
});
