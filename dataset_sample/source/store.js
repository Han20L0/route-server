const fs = require("fs");
var mysql = require("mysql");

// parse
const waysdata = JSON.parse(fs.readFileSync("./dataset2/source/ways.json"));
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

for (const waysID in waysdata) {
  const ways = waysdata[waysID];
  const query = `INSERT INTO tb_ways (id,nodes,tags) VALUES (?, ?, ?)`;
  const values = [waysID, JSON.stringify(ways.nodes), JSON.stringify(ways.tags)];
  // console.log(values);

  con.query(query, values, function (err, result) {
    if (err) throw err;
    // console.log("records inserted:"+result.affectedRows)
  });
  count++;
}

console.log(`saved data: ${count}`);
