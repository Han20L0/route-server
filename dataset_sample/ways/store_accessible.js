const fs = require("fs");
var mysql = require("mysql");

// parse
const accessible_data = JSON.parse(fs.readFileSync("./dataset2/ways/accessible.json"));
//console.log(nodes);

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbmobile_database",
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected");
});

let count = 0;

for (const way_id of accessible_data) {
  const query = `INSERT INTO tb_accessible_ways (way_id) VALUES (${way_id})`;
  con.query(query, function (err, result) {
    if (err) throw err;
  });
  count++;
}

console.log(`saved data: ${count}`);
