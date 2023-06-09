const fs = require("fs");
const { nodes_dataset_path } = require("../../constants");

// Baca file dataset
const nodes_list = JSON.parse(fs.readFileSync(nodes_dataset_path, "utf-8"));

function search_connectors(sourceNodeID, targetNodeID) {
  // approaches
  // 1. get source/target nodes coordinates
  // 2. set south/west/north/east bounds for nodes search
  // 3. get all nodes within bounds using nodes_dev.json
  // 4. get all connection between nodes using intersection.json
  // 5. return possible connections

  // 1. get source/target nodes coordinates
  const sourceNode = nodes_list[sourceNodeID];
  const targetNode = nodes_list[targetNodeID];

  const sourceLon = sourceNode.lon,
    sourceLat = sourceNode.lat;

  const targetLon = targetNode.lon,
    targetLat = targetNode.lat;

  // 2. set south/west/north/east bounds for intersection search
  let south = sourceLat,
    west = sourceLon,
    north = sourceLat,
    east = sourceLon;

  if (south > targetLat) south = targetLat;
  if (west > targetLon) west = targetLon;
  if (targetLat > north) north = targetLat;
  if (targetLon > east) east = targetLon;

  // 3. get all nodes within bounds using nodes_dev.json
}

module.exports = { search_connectors };
