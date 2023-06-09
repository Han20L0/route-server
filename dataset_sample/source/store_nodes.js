const fs = require("fs");
var mysql = require("mysql");

// parse
const nodesData = JSON.parse(fs.readFileSync("./dataset2/source/nodes.json"));
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

for (const nodeID in nodesData) {
  const { lat, lon } = nodesData[nodeID];

  const query = `INSERT INTO tb_nodes (id, lat, lon) VALUES (?, ?, ?)`;
  const values = [parseInt(nodeID), lat, lon];

  // console.log(values);

  con.query(query, values, function (err, result) {
    if (err) throw err;
    // console.log("records inserted:"+result.affectedRows)
  });
  count++;
}

console.log(`saved data: ${count}`);
