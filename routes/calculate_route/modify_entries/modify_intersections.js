function calculate_euclidean_distance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

function insert_source_point(nearby_access_point, intersections, point_name) {
  const { nearby_coordinate, nearby_connector_id, nearby_intersection_id } = nearby_access_point;

  // approaches:
  // 1. get both ends of nearby_intersection and intersection data
  // 2. connect nearby_coordinate to the ends making 2 new connectors
  // 3. get properties of 2 connectors using the original nearby connector data
  // 4. remove nearby_connector and its alternative if available

  // 1. get both ends of nearby_connector and connector data
  const [sourceID, targetID, via_way_id] = nearby_intersection_id.split(",");
  const nearby_intersection = intersections[nearby_intersection_id];

  const { source_lat, source_lon, target_lat, target_lon } = nearby_intersection;

  // 2. connect nearby_coordinate to the ends making 2 new connectors
  const source_point_id = `${sourceID},${point_name},${via_way_id}`;
  const [point_lat, point_lon] = nearby_coordinate;

  const connector_list = JSON.parse(nearby_intersection.connector_list);
  const new_connector_list = [];
  for (const connectorID of connector_list) {
    if (connectorID === nearby_connector_id) {
      const [connector_source, _] = connectorID.split(",");

      new_connector_list.push(`${connector_source},${point_name}`);
      break;
    }

    new_connector_list.push(connectorID);
  }

  // 3. get properties of 2 connectors using the original nearby connector data
  intersections[source_point_id] = {
    ...nearby_intersection,
    ...{
      target_lat: point_lat,
      target_lon: point_lon,
      target_node_id: point_name,
      connector_list: JSON.stringify(new_connector_list),
    },
  };

  if (intersections[`${targetID},${sourceID},${via_way_id}`]) {
    const alternate_id = `${point_name},${sourceID},${via_way_id}`;

    const reversed_connector_list = [...new_connector_list].reverse().map((connector) => {
      const [source, target] = connector.split(",");
      return `${target},${source}`;
    });

    intersections[alternate_id] = {
      ...nearby_intersection,
      ...{
        source_lat: point_lat,
        source_lon: point_lon,
        source_node_id: point_name,
        target_node_id: sourceID,
        target_lat: source_lat,
        target_lon: source_lon,
        connector_list: JSON.stringify(reversed_connector_list),
      },
    };
  }

  return intersections;
}

function insert_point_target(nearby_access_point, intersections, point_name) {
  const { nearby_coordinate, nearby_connector_id, nearby_intersection_id } = nearby_access_point;

  // approaches:
  // 1. get both ends of nearby_intersection and intersection data
  // 2. connect nearby_coordinate to the ends making 2 new connectors
  // 3. get properties of 2 connectors using the original nearby connector data
  // 4. remove nearby_connector and its alternative if available

  // 1. get both ends of nearby_connector and connector data
  const [sourceID, targetID, via_way_id] = nearby_intersection_id.split(",");
  const nearby_intersection = intersections[nearby_intersection_id];

  const { source_lat, source_lon, target_lat, target_lon } = nearby_intersection;

  // 2. connect nearby_coordinate to the ends making 2 new connectors
  const point_target_id = `${point_name},${targetID},${via_way_id}`;
  const [point_lat, point_lon] = nearby_coordinate;

  const connector_list = JSON.parse(nearby_intersection.connector_list);

  const new_connector_list = [];
  let flag = false;
  for (const connectorID of connector_list) {
    const [connector_source, connetor_target] = connectorID.split(",");

    if (connectorID === nearby_connector_id) {
      flag = true;
      new_connector_list.push(`${point_name},${connetor_target}`);
      continue;
    }

    if (flag) {
      new_connector_list.push(`${connector_source},${connetor_target}`);
    }
  }

  // 3. get properties of 2 connectors using the original nearby connector data
  intersections[point_target_id] = {
    ...nearby_intersection,
    ...{
      source_node_id: point_name,
      source_lon: point_lon,
      source_lat: point_lat,
      connector_list: JSON.stringify(new_connector_list),
    },
  };

  if (intersections[`${targetID},${sourceID},${via_way_id}`]) {
    const alternate_id = `${targetID},${point_name},${via_way_id}`;

    const alternate_list = [...new_connector_list].reverse().map((connector) => {
      const [source, target] = connector.split(",");
      return `${target},${source}`;
    });

    intersections[alternate_id] = {
      ...nearby_intersection,
      ...{
        source_node_id: targetID,
        target_node_id: point_name,
        source_lat: target_lat,
        source_lon: target_lon,
        target_lat: point_lat,
        target_lon: point_lon,
        connector_list: JSON.stringify(alternate_list),
      },
    };
  }

  return intersections;
}

function insert_start_finish(start_access_points, finish_access_points, intersections) {
  const { nearby_coordinate: start_coordinate, nearby_connector_id: start_connector, nearby_intersection_id } = start_access_points;
  const { nearby_coordinate: finish_coordinate, nearby_connector_id: finish_connector } = finish_access_points;

  const [sourceID, targetID, via_way_id] = nearby_intersection_id.split(",");
  const nearby_intersection = intersections[nearby_intersection_id];

  const [start_lat, start_lon] = start_coordinate;
  const [finish_lat, finish_lon] = finish_coordinate;

  const start_finish_id = `start,finish,${via_way_id}`;

  const connector_list = JSON.parse(nearby_intersection.connector_list);
  let new_connector_list = [];

  if (start_connector === finish_connector) {
    new_connector_list = ["start,finish"];
  } else {
    let flag = false;

    for (const connectorID of connector_list) {
      const [connector_source, connector_target] = connectorID.split(",");

      if (connectorID === start_connector) {
        new_connector_list.push(`start,${connector_target}`);
        flag = true;
        continue;
      }

      if (flag) {
        if (connectorID === finish_connector) {
          new_connector_list.push(`${connector_source},finish`);
          break;
        }

        new_connector_list.push(connectorID);
      }
    }
  }

  intersections[start_finish_id] = {
    ...nearby_intersection,
    ...{
      source_node_id: "start",
      source_lat: start_lat,
      source_lon: start_lon,
      target_node_id: "finish",
      target_lat: finish_lat,
      target_lon: finish_lon,
      connector_list: JSON.stringify(new_connector_list),
    },
  };

  const alt_intersection = intersections[`${targetID},${sourceID},${via_way_id}`];

  if (alt_intersection) {
    const alt_id = `finish,start,${via_way_id}`;
    const alt_new_connector_list = [...new_connector_list].reverse().map((connector) => {
      const [source, target] = connector.split(",");
      return `${target},${source}`;
    });

    intersections[alt_id] = {
      ...alt_intersection,
      ...{
        source_node_id: "finish",
        source_lat: finish_lat,
        source_lon: finish_lon,
        target_node_id: "start",
        target_lat: start_lat,
        target_lon: start_lon,
        connector_list: JSON.stringify(alt_new_connector_list),
      },
    };
  }

  return intersections;
}

function get_merge_order(start_access_points, finish_access_points, intersections) {
  const { nearby_coordinate: start_coordinate, nearby_intersection_id } = start_access_points;
  const { nearby_coordinate: finish_coordinate } = finish_access_points;

  const intersection = intersections[nearby_intersection_id];

  const { source_lat, source_lon, target_lat, target_lon, source_node_id, target_node_id } = intersection;

  const source_distance = calculate_euclidean_distance(0, 0, source_lat, source_lon);
  const target_distance = calculate_euclidean_distance(0, 0, target_lat, target_lon);

  let merge_order = [source_node_id, target_node_id];
  const is_reversed = source_distance > target_distance;

  if (is_reversed) {
    merge_order.reverse();
  }

  const nearby_start_distance = calculate_euclidean_distance(0, 0, start_coordinate[0], start_coordinate[1]);
  const nearby_end_distance = calculate_euclidean_distance(0, 0, finish_coordinate[0], finish_coordinate[1]);

  const order = nearby_start_distance < nearby_end_distance ? ["start", "finish"] : ["finish", "start"];
  merge_order = [merge_order[0], ...order, merge_order[1]];

  if (is_reversed) {
    merge_order.reverse();
  }

  return merge_order;
}

function merge_intersections(start_access_points, finish_access_points, intersections) {
  const merge_order = get_merge_order(start_access_points, finish_access_points, intersections);

  if (merge_order[1] === "start") {
    intersections = insert_source_point(start_access_points, intersections, "start");
    intersections = insert_point_target(finish_access_points, intersections, "finish");
  } else {
    intersections = insert_source_point(finish_access_points, intersections, "finish");
    intersections = insert_point_target(start_access_points, intersections, "start");
  }

  intersections = insert_start_finish(start_access_points, finish_access_points, intersections);

  return intersections;
}

function remove_intersection(nearby_access_point, intersections) {
  const { nearby_intersection_id } = nearby_access_point;
  const [sourceID, targetID, via_way_id] = nearby_intersection_id.split(",");

  delete intersections[`${sourceID},${targetID},${via_way_id}`];
  delete intersections[`${targetID},${sourceID},${via_way_id}`];

  return intersections;
}

function modified_intersections(start_access_points, finish_access_points, intersections) {
  if (start_access_points.nearby_intersection_id === finish_access_points.nearby_intersection_id) {
    intersections = merge_intersections(start_access_points, finish_access_points, intersections);
    intersections = remove_intersection(start_access_points, intersections);
  } else {
    intersections = insert_source_point(start_access_points, intersections, "start");
    intersections = insert_point_target(start_access_points, intersections, "start");

    intersections = insert_source_point(finish_access_points, intersections, "finish");
    intersections = insert_point_target(finish_access_points, intersections, "finish");

    intersections = remove_intersection(start_access_points, intersections);
    intersections = remove_intersection(finish_access_points, intersections);
  }

  for (const intersectionID in intersections) {
    if (intersectionID.includes("start") || intersectionID.includes("finish")) {
      // console.log(intersections[intersectionID]);
    }
  }

  return intersections;
}

module.exports = modified_intersections;
