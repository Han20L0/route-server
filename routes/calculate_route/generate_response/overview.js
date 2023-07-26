const mapboxPolyline = require("@mapbox/polyline");

function generate_overview_waypoints(paths, intersections, connectors) {
  const waypoints_coordinates_set = new Set();
  const traffics = [];

  // get all intersections' connector
  for (let pathIdx = 0; pathIdx < paths.length - 1; pathIdx++) {
    const intersectionID = `${paths[pathIdx]},${paths[pathIdx + 1]}`;
    const { connector_list } = intersections[intersectionID];

    for (const connectorID of JSON.parse(connector_list)) {
      const { source_lat, source_lon, target_lat, target_lon, traffic } = connectors[connectorID];
      waypoints_coordinates_set.add(`${source_lat},${source_lon}`);
      waypoints_coordinates_set.add(`${target_lat},${target_lon}`);
      traffics.push(traffic);
    }
  }

  let waypoints = [];
  for (const waypoints_coordinate of Array.from(waypoints_coordinates_set)) {
    const [lat, lon] = waypoints_coordinate.split(",").map((coord) => parseFloat(coord));
    waypoints.push([lat, lon]);
  }

  return { waypoints, traffics };
}

function generate_overview_geoemetries(waypoints) {
  const geometries = mapboxPolyline.encode(waypoints, 6);
  return geometries;
}

function generate_overview_geoemetries_traffic(waypoints, traffics) {
  let geometries_traffic = [];
  for (let waypointIdx = 0; waypointIdx < waypoints.length - 1; waypointIdx++) {
    const step = [waypoints[waypointIdx], waypoints[waypointIdx + 1]];
    const geometry = mapboxPolyline.encode(step, 6);

    geometries_traffic.push([geometry, traffics[waypointIdx]]);
  }

  return geometries_traffic;
}

function generate_overview_info(paths, intersections, connectors) {
  let total_distance = 0,
    total_duration = 0,
    total_cost = 0;

  // get all intersections' connector
  for (let pathIdx = 0; pathIdx < paths.length - 1; pathIdx++) {
    const intersectionID = `${paths[pathIdx]},${paths[pathIdx + 1]}`;
    const { connector_list } = intersections[intersectionID];

    for (const connectorID of JSON.parse(connector_list)) {
      const { cost, duration, distance } = connectors[connectorID];
      total_distance += distance;
      total_duration += duration;
      total_cost += cost;
    }
  }

  return { total_distance, total_duration, total_cost };
}

function generate_overview_path(paths) {
  // paths.reverse();

  let pathString = "";

  paths.forEach((path, idx) => {
    pathString += `${path} `;

    if (idx < paths.length - 1) {
      pathString += "-> ";
    }
  });

  return pathString;
}

function generate_overview(paths, intersections, connectors) {
  const overview_info = generate_overview_info(paths, intersections, connectors);
  const { waypoints, traffics } = generate_overview_waypoints(paths, intersections, connectors);

  const overview_geometries = generate_overview_geoemetries(waypoints);
  const overview_geometries_traffic = generate_overview_geoemetries_traffic(waypoints, traffics);
  const pathString = generate_overview_path(paths);

  return { overview_info, overview_geometries, overview_geometries_traffic, pathString };
}

module.exports = generate_overview;
