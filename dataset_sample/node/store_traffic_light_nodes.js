const fs = require("fs");
const mysql = require("mysql");

// Membaca file JSON
const traffic_light_nodes = JSON.parse(fs.readFileSync("./dataset2/node/traffic_signal_nodes.json"));

// Koneksi ke database
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbmobile_database",
});

async function store() {
  // Menghubungkan ke database
  con.connect(function (err) {
    if (err) throw err;
    console.log("Connected to database");
  });

  for (const node_id of traffic_light_nodes) {
    await new Promise((resolve, reject) => {
      const query = `INSERT INTO tb_traffic_light_nodes (node_id) VALUES (${node_id})`;
      con.query(query, function (err, result) {
        if (err) throw err;
        resolve();
      });
    });
  }

  con.end();
}

store();
