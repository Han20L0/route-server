const fs = require("fs");
const path = require("path");

const apiUrl = "https://www.overpass-api.de/api/interpreter?";
const proximity = 5;
const datasetPath = path.join(__dirname, "data", "dataset.json");

function findNearestNode(latitude, longitude) {
    // Baca file dataset
    const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));

    // Lakukan pencarian node terdekat menggunakan Overpass API
    return fetch(`${apiUrl}[out:json][timeout:25];way[highway](around:${proximity},${latitude},${longitude});out body;>;out skel qt;`)
        .then((api) => api.json())
        .then((data) => {
            // Hitung jarak dari setiap node ke titik input
            const inputLat = parseFloat(latitude);
            const inputLon = parseFloat(longitude);
            let closestNode = null;
            let closestDistance = Infinity;
            data.elements.forEach((element) => {
                if (element.type === "node") {
                    const nodeLat = parseFloat(element.lat);
                    const nodeLon = parseFloat(element.lon);
                    const distance = Math.sqrt(Math.pow(inputLat - nodeLat, 2) + Math.pow(inputLon - nodeLon, 2));
                    if (distance < closestDistance) {
                        closestNode = element;
                        closestDistance = distance;
                    }
                }
            });

            // Periksa apakah node terdapat dalam dataset
            if (closestNode && dataset.nodes.hasOwnProperty(closestNode.id)) {
                return closestNode.id;
            } else {
                throw new Error(`Node terdekat dengan ID ${closestNode.id} tidak ditemukan dalam dataset.`);
            }
        });
}

module.exports = {
    findNearestNode,
};
