const fs = require("fs");
const mysql = require("mysql");

// Membaca file JSON
const intersection_connectors = JSON.parse(fs.readFileSync("./dataset2/intersection/intersection_connector.json"));

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

  // store intersection_connector data
  for (const source_node_id in intersection_connectors) {
    const targets = intersection_connectors[source_node_id];

    for (const target of targets) {
      const { targetNodeId, ViaWayId, connectors: connector_node_id_list } = target;

      const connector_id_list = [];
      for (let connector_index = 0; connector_index < connector_node_id_list.length - 1; connector_index++) {
        let previous_connector_id = connector_node_id_list[connector_index];
        let next_connector_id = connector_node_id_list[connector_index + 1];

        // query for connector id
        const connector_id = await new Promise((resolve, reject) => {
          const query = `SELECT id FROM tb_connector WHERE source_node_id=${previous_connector_id} AND target_node_id=${next_connector_id} AND via_way_id=${ViaWayId}`;
          con.query(query, function (err, result) {
            if (err) throw err;
            resolve(result[0].id);
          });
        });

        // add connector id
        connector_id_list.push(connector_id);
      }

      // get intersection_id
      const intersection_id = await new Promise((resolve, reject) => {
        const query = `SELECT id from tb_intersections WHERE source_node_id=${source_node_id} AND target_node_id=${targetNodeId} AND via_way_id=${ViaWayId}`;
        con.query(query, function (err, result) {
          if (err) throw err;
          resolve(result[0].id);
        });
      });

      // store to intersection_connector table
      const query = `INSERT INTO tb_intersection_connector(inter_id, connector_id_list) VALUES (?,?)`;
      const values = [intersection_id, JSON.stringify(connector_id_list)];

      await new Promise((resolve, reject) => {
        con.query(query, values, function (err, result) {
          if (err) throw err;
          resolve();
        });
      });
    }
  }

  con.end();
}

store();
