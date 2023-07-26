const app = require("./app");

const set_express_routes = require("./routes");
const { connect_db, mysql_query } = require("./mysql");
const cors = require("cors");
const swaggerDocs = require("./docs/swagger");

const port = 3000;

app.use(cors());

app.listen(port, async () => {
  connect_db();
  setTimeout(() => {
    mysql_query("SELECT 1");
  }, 1000);

  set_express_routes();

  swaggerDocs(app);
  console.log(`server ready at port ${port}!`);
});
