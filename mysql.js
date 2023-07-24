const mysql = require("mysql");

const host = "localhost";
const user = "root";
const password = "";
const database = "sample_route_db";

const connection = mysql.createConnection({
  host,
  user,
  password,
  database,
});

const connect_db = () => {
  if (connection.state === "connected") {
    connection.connect((err) => {
      if (err) throw console.log(err);
      console.log("DB connected!");
    });
  }
};

const mysql_query = async (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, function (err, results) {
      if (err) throw console.log(err);
      resolve(results);
    });
  });
};

const end_db = () => {
  connection.end((err) => {
    if (err) throw console.log(err);
    console.log("connection closed!");
  });
};

module.exports = { connection, connect_db, mysql_query, end_db };
