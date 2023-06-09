//Using module fs
const fs = require("fs");
const path = require("path");

const { nodes_dataset_path } = require("../../constants");

// Baca file dataset
const dataset = JSON.parse(fs.readFileSync(nodes_dataset_path, "utf-8"));

async function seaching_nearest_node(coordinates) {
  const apiUrl = "https://www.overpass-api.de/api/interpreter?";
  const proximity = 10;
  const latitude = coordinates[0];
  const longitude = coordinates[1];

  // Lakukan pencarian node terdekat menggunakan Overpass API
  const query = `[out:json][timeout:25];way[highway](around:${proximity},${latitude},${longitude});out body;>;out skel qt;`;
  const api = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: query,
  });
  const data = await api.json();

  //Hitung jarak dari setiap node ke titik input
  const inputLat = parseFloat(latitude);
  const inputLon = parseFloat(longitude);
  let closestNode_id = null;
  let closestDistance = Infinity;

  data.elements.forEach((element) => {
    if (element.type === "node") {
      const nodeLat = parseFloat(element.lat);
      const nodeLon = parseFloat(element.lon);
      const distance = Math.sqrt(Math.pow(inputLat - nodeLat, 2) + Math.pow(inputLon - nodeLon, 2));
      if (distance < closestDistance) {
        closestNode_id = element.id;
        closestDistance = distance;
      }
    }
  });

  //Periksa apakah node terdapat dalam dataset
  const closestNode_dataset = dataset[closestNode_id];

  if (closestNode_dataset) {
    console.log(`Node terdekat dengan ID ${closestNode_id} ditemukan dalam dataset.`);
    return closestNode_id;
  } else {
    console.log(`Node terdekat dengan ID ${closestNode_id} tidak ditemukan dalam dataset. Mencari node terdekat lainnya...`);
  }

  return closestNode_id;
}

module.exports = { seaching_nearest_node };
