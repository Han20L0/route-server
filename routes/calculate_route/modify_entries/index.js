const modify_connectors = require("./modify_connectors");
const modifiy_intersections = require("./modify_intersections");

function modify_entries(start_access_points, finish_access_points, connectors, intersections) {
  // if (nearby_source_access_points.nearby_connector_id === nearby_target_access_points.nearby_connector_id) {
  //   console.log("samaaa");
  // }

  const modified_connectors = modify_connectors(start_access_points, finish_access_points, connectors);
  const modified_intersections = modifiy_intersections(start_access_points, finish_access_points, intersections);

  return { modified_connectors, modified_intersections };
}

module.exports = modify_entries;
