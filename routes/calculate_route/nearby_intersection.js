const { mysql_query } = require("../../mysql");

async function search_nearby_nodes(input_coordinates, boundings) {
  // returns 2 nearby intersection nodes with input coordinates is between those
  // example input_coordinates (lat): -6.905
  // nearby1 (lat) must be > -6.905 and nearby2(lat) must be < -6.905
  // note: can be horizontally, vertically, or both

  // approaches:
  // 1. get latitude and longitude of input coordinates
  // 2. get boundings
  // 3. perform mysql query:
  // - get lat,lon from tb_nodes
  // - create distance column using calculation of euclidean distance of input_coordinates and tb_nodes coordinates
  // - restrict lat and lon ranges using boundings
  // - return results
  // 4. return all intersection node IDs

  // 1. get latitude and longitude of input coordinates
  const sourceLat = input_coordinates[0],
    sourceLon = input_coordinates[1];

  // 2. get boundings
  const { west, east, south, north } = boundings;

  // 4. perform mysql query:
  // - get source_node_id from tb_intersection and lat,lon from tb_nodes
  // - create distance column using calculation of euclidean distance of input_coordinates and intersection_coordinates
  // - restrict lat and lon ranges using boundings
  const distanceQuery = `SQRT(POW((lat - ${sourceLat}), 2) + POW((lon - ${sourceLon}), 2))`;
  const restrictQuery = `lat < ${north} AND lat > ${south} AND lon > ${west} AND lon < ${east}`;
  const query = `SELECT id, lat, lon, ${distanceQuery} AS distance
                FROM tb_nodes
                WHERE ${restrictQuery}
                ORDER BY distance ASC LIMIT 100;`;

  let results = await mysql_query(query);

  // 6. set first nearest intersection node and second nearest by same via_way_id as first nearest
  const nearest_node = results;

  // 7. return two nearest intersection node IDs
  return nearest_node;
}

function get_nearby_connector(input_coordinates, nearby_nodes, connectors) {
  // approaches:
  // 1. get the nearest node
  // 2. search connectors that has the nearest node
  // 3. check the other end of found connectors, make sure the input coordinates is between ends of connector

  function search_possible_connectors(nodeID) {
    nodeID = "" + nodeID;
    const possible_connector_ids = [];

    for (const connectorID in connectors) {
      const [sourceID, targetID] = connectorID.split(",");

      if (sourceID === nodeID) possible_connector_ids.push(connectorID);
      if (targetID === nodeID) possible_connector_ids.push(connectorID);
    }

    return possible_connector_ids;
  }

  function check_coordinate_between_connector(input_coordinates, connectorID) {
    // using the bound method to check if input is in between connector
    const connector = connectors[connectorID];
    const { source_lat, source_lon, target_lat, target_lon } = connector;

    const top_bound = source_lat >= target_lat ? source_lat : target_lat;
    const bottom_bound = source_lat <= target_lat ? source_lat : target_lat;
    const left_bound = source_lon <= target_lon ? source_lon : target_lon;
    const right_bound = source_lon >= target_lon ? source_lon : target_lon;

    const inputLat = input_coordinates[0],
      inputLon = input_coordinates[1];

    const is_middle_lat = top_bound >= inputLat && bottom_bound <= inputLat;
    const is_middle_lon = right_bound >= inputLon && left_bound <= inputLon;

    return is_middle_lat || is_middle_lon;
  }

  for (const nearby_node of nearby_nodes) {
    // 1. get the nearest node
    const nearest_node = nearby_node;

    // 2. search connectors that has the nearest node
    const possible_connector_ids = search_possible_connectors(nearest_node.id);

    for (const possible_connector_id of possible_connector_ids) {
      // 3. check the other end of found connectors, make sure the input coordinates is between ends of connector
      // console.log(possible_connector_id, check_coordinate_between_connector(input_coordinates, possible_connector_id));
      if (check_coordinate_between_connector(input_coordinates, possible_connector_id)) {
        return possible_connector_id;
      }
    }
  }
}

async function get_nearby_connector_OSRM(input_coordinates, connectors) {
  const inputLat = input_coordinates[0],
    inputLon = input_coordinates[1];

  const URL = `https://router.project-osrm.org/nearest/v1/driving/${inputLon},${inputLat}?number=100`;
  const request = await fetch(URL);
  const responseJSON = await request.json();

  const possible_nearby = [];

  for (const response_connector of responseJSON.waypoints) {
    const { nodes, location } = response_connector;

    const [sourceID, targetID] = nodes;
    location.reverse();

    let id = `${sourceID},${targetID}`;
    if (connectors[id]) {
      possible_nearby.push({ id, location });
    }

    id = `${targetID},${sourceID}`;
    if (connectors[id]) {
      possible_nearby.push({ id, location });
    }
  }

  return possible_nearby;
}

function get_nearby_intersection_id_via_connector(intersections, nearby_connector_id) {
  const [sourceID, targetID] = nearby_connector_id.split(",");
  nearby_connector_id = `${sourceID},${targetID}`;

  for (const intersectionID in intersections) {
    const { connector_list } = intersections[intersectionID];

    if (connector_list.includes(nearby_connector_id)) {
      return intersectionID;
    }
  }
}

function get_coordinate_connector_cost(nearby_coordinate, connector_id, connectors) {
  function calculate_euclidean_distance(lat1, lon1, lat2, lon2) {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
  }

  const inputLon = nearby_coordinate[0],
    inputLat = nearby_coordinate[1];

  const connector = connectors[connector_id];
  const { source_lat, source_lon, target_lat, target_lon, cost, distance } = connector;

  const source_distance = calculate_euclidean_distance(source_lat, source_lon, inputLat, inputLon);
  const target_distance = calculate_euclidean_distance(target_lat, target_lon, inputLat, inputLon);

  const source_cost = (source_distance / distance) * cost;
  const target_cost = (target_distance / distance) * cost;

  return [source_cost, target_cost];
}

function connect_ends(nearby_coordinate, nearby_connector_id, nearby_intersection_id, connectors, intersections) {
  // 5. get initial costs for both connector ends unto both intersection ends
  const connector_cost = get_coordinate_connector_cost(nearby_coordinate, nearby_connector_id, connectors);

  const [source_connector, target_connector] = nearby_connector_id.split(",");
  const [source_intersection, target_intersection] = nearby_intersection_id.split(",");

  let initialCost_source = connector_cost[0],
    initialCost_target = connector_cost[1];

  const connector_list = JSON.parse(intersections[nearby_intersection_id].connector_list);
  for (const connectorID of connector_list) {
    if (connectorID === nearby_connector_id) break;
    initialCost_source += connectors[connectorID].cost;
  }

  const reverted_connector_list = connector_list.reverse();
  for (const connectorID of reverted_connector_list) {
    if (connectorID === nearby_connector_id) break;
    initialCost_target += connectors[connectorID].cost;
  }

  return [
    { connector: source_connector, intersection: source_intersection, cost: initialCost_source },
    { connector: target_connector, intersection: target_intersection, cost: initialCost_target },
  ];
}

async function search_nearby_access_points(input_coordinates, boundings, connectors, intersections) {
  // approaches:
  // 1. parse input coordinate into latitude, longitude
  // 2. get nearest nodes
  // 3. get where connector is the input coordinates in
  // 4. get 2 nearest intersection by 2 connectors ends
  // 5. connect both 2 of connectors ends with both 2 of intersection ends
  // 5. get cost of input coordinate to nearest connector
  // 6. get cost of nearest connector to nearest intersections
  // 7. wrap nearest connector, nearest intersection, and inital cost

  // 2. get nearest access point and nearest connector via OSRM-nearest
  const possible_nearbies = await get_nearby_connector_OSRM(input_coordinates, connectors);

  let location_found = false;
  let nearby_coordinate = "";
  let nearby_connector_id;
  let nearby_intersection_id = "";

  // 4. get 2 nearest intersection by 2 connectors ends
  for (const { location, id } of possible_nearbies) {
    const test_nearby_connector_id = id;

    const test_nearby_intersection_id = get_nearby_intersection_id_via_connector(intersections, test_nearby_connector_id);

    if (test_nearby_intersection_id) {
      location_found = true;
      nearby_coordinate = location;
      nearby_connector_id = test_nearby_connector_id;
      nearby_intersection_id = test_nearby_intersection_id;
      break;
    }
  }

  return { location_found, nearby_coordinate, nearby_connector_id, nearby_intersection_id };
}

function search_nearby_nodes_by_intersection(intersections, nearby_nodes, coordinate) {
  for (const nearby_node of nearby_nodes) {
    const nearby_id = nearby_node.id;

    for (const intersectionID in intersections) {
      const { connector_list, source_node_id, target_node_id, via_way_id } = intersections[intersectionID];

      if (parseInt(source_node_id) === parseInt(nearby_id)) {
        return [source_node_id, target_node_id];
      }

      if (parseInt(target_node_id) === parseInt(nearby_id)) {
        return [source_node_id, target_node_id];
      }

      if (JSON.stringify(connector_list).includes(nearby_id)) {
        return [source_node_id, target_node_id];
      }
    }

    console.log(`not found nearby for ${nearby_id}`);
  }
}

module.exports = { search_nearby_access_points, search_nearby_nodes, search_nearby_nodes_by_intersection };
