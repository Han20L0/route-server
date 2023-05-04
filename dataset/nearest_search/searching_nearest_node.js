function seaching_nearest_node(lat,lon){
    
    //Using module fs
    const fs = require("fs");
    const path = require("path");

    const apiUrl = "https://www.overpass-api.de/api/interpreter?";
    const proximity = 5;
    const latitude = lat;
    const longitude = lon;

    // Path lengkap file dataset
    const datasetPath = path.join(__dirname, "nodes_dev.json");

    // Baca file dataset
    const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));

    // Lakukan pencarian node terdekat menggunakan Overpass API
    (async () => {
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
        console.log(data);

        //Hitung jarak dari setiap node ke titik input
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

        //Periksa apakah node terdapat dalam dataset
        const closestNodeId = dataset.nodes.find(node => node.id === closestNode.id)?.id;

        if (closestNodeId) {
            console.log(`Node terdekat dengan ID ${closestNodeId} ditemukan dalam dataset.`);
            return closestNodeId;
        } else {
            console.log(`Node terdekat dengan ID ${closestNode.id} tidak ditemukan dalam dataset. Mencari node terdekat lainnya...`);
        }
    })();
}

module.exports = {seaching_nearest_node};