const fs = require("fs");
const mysql = require("mysql");

// Membaca file JSON
const intersectionData = JSON.parse(fs.readFileSync("./dataset2/intersection/intersections.json"));
const geometryData = JSON.parse(fs.readFileSync("./dataset2/geometry/high.json"));
const distanceData = JSON.parse(fs.readFileSync("./dataset2/distance/distance.json"));

// Koneksi ke database
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dbmobile_database",
});

// Menghubungkan ke database
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to database");

  let count = 1;

  for (const source_node_id in intersectionData) {
    const intersections = intersectionData[source_node_id];

    // Membuat query INSERT
    const query = `INSERT INTO tb_intersections (source_node_id, target_node_id, via_way_id) VALUES (?, ?, ?)`;

    // Menjalankan query dengan setiap pasangan targetNodeId dan ViaWayId
    intersections.forEach((item) => {
      const values = [parseInt(source_node_id), item.targetNodeId, item.ViaWayId];

      con.query(query, values, function (err, result) {
        if (err) throw err;
        const insert_id = result.insertId;

        // query distance(inter, insert)

        const { duration, distance } = distanceData[source_node_id][item.targetNodeId];
        const queryDistanace = `INSERT INTO tb_distance (inter_id, duration, distance) VALUES (?, ?, ?)`;
        const valuesDistance = [insert_id, duration, distance];

        con.query(queryDistanace, valuesDistance, function (err, result) {
          if (err) throw err;
          //console.log(`Data inserted: ${result.affectedRows}`);
        });

        const geometry = geometryData[`${source_node_id}${item.targetNodeId}`];
        const queryGeometry = `INSERT INTO tb_geometry (inter_id, geometry) VALUES (?, ?)`;
        const valuesGeometry = [insert_id, geometry];

        con.query(queryGeometry, valuesGeometry, function (err, result) {
          if (err) throw err;
          //console.log(`Data inserted: ${result.affectedRows}`);
        });
      });

      count++;
    });
  }

  console.log(`saved data: ${count}`);
});
