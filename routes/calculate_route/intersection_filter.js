const fs = require("fs");
const { intersection_dataset_path } = require("../constants");

// Baca file dataset
const intersection_list = JSON.parse(fs.readFileSync(intersection_dataset_path, "utf-8"));

function get_intersectionNodes_within_nodes(selectedNodeIDs) {
  let selectedIntersectionNodeIDs = [];

  for (const intersectionID in intersection_list) {
    if (selectedNodeIDs.includes(intersectionID)) {
      // exception for end nodes, not included!
      // if (intersection_list[intersectionID].length > 1) {
      selectedIntersectionNodeIDs.push(intersectionID);
      // }
    }
  }

  return selectedIntersectionNodeIDs;
}

module.exports = { get_intersectionNodes_within_nodes };
