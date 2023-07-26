const mysql = require("mysql");

const host = "localhost";
const user = "root";
const password = "";
const database = "sample_route_db";

// const host = "srv167.niagahoster.com";
// const user = "iiap1764_iiko";
// const password = "uJU0+p?_48R}";
// const database = "iiap1764_sample_route_db";

const connection = mysql.createPool({
  host,
  user,
  password,
  database,
  connectionLimit: 10,
  acquireTimeout: 10000,
});

const connect_db = () => {
  // connection.connect((err) => {
  //   if (err) throw console.log(err);
  //   console.log("DB connected!");
  // });

  return connection.config;
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
