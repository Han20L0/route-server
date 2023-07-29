const mapboxPolyline = require("@mapbox/polyline");

function calculate_euclidean_distance(lat1, lon1, lat2, lon2) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

function search_geometry(lat1, lon1, lat2, lon2) {
  const geometry = mapboxPolyline.encode([
    [lat1, lon1],
    [lat2, lon2],
  ]);
  return geometry;
}

function insert_source_point(nearby_access_point, connectors, point_name) {
  const { nearby_coordinate, nearby_connector_id } = nearby_access_point;
  const [sourceID, targetID] = nearby_connector_id.split(",");

  const connector = connectors[nearby_connector_id];

  const { source_lat, source_lon, target_lat, target_lon, distance, duration, n_distance, n_duration } = connector;
  const [point_lat, point_lon] = nearby_coordinate;

  // 2. connect nearby_coordinate to the ends making 2 new connectors
  const source_point_id = `${sourceID},${point_name}`;

  // 3. get properties of 2 connectors using the original nearby connector data
  const source_point_euclidean_distance = calculate_euclidean_distance(source_lat, source_lon, point_lat, point_lon);
  const source_target_euclidean_distance = calculate_euclidean_distance(source_lat, source_lon, target_lat, target_lon);

  const new_distance = (source_point_euclidean_distance / source_target_euclidean_distance) * distance;
  const new_duration = (source_point_euclidean_distance / source_target_euclidean_distance) * duration;
  const new_n_distance = (source_point_euclidean_distance / source_target_euclidean_distance) * n_distance;
  const new_n_duration = (source_point_euclidean_distance / source_target_euclidean_distance) * n_duration;

  const source_point_geometry = search_geometry(source_lat, source_lon, point_lat, point_lon);
  connectors[source_point_id] = {
    ...connector,
    ...{
      distance: new_distance,
      duration: new_duration,
      n_distance: new_n_distance,
      n_duration: new_n_duration,
      geometry: source_point_geometry,
      target_lat: point_lat,
      target_lon: point_lon,
      target_node_id: point_name,
    },
  };

  const alt_connector = connectors[`${targetID},${sourceID}`];

  if (alt_connector) {
    const point_source_id = `${point_name},${sourceID}`;
    const point_source_geometry = search_geometry(point_lat, point_lon, source_lat, source_lon);
    connectors[point_source_id] = {
      ...alt_connector,
      ...{
        source_lat: point_lat,
        source_lon: point_lon,
        source_node_id: point_name,
        geometry: point_source_geometry,
        distance: new_distance,
        duration: new_duration,
        n_distance: new_n_distance,
        n_duration: new_n_duration,
      },
    };
  }

  return connectors;
}

function insert_point_target(nearby_access_point, connectors, point_name) {
  const { nearby_coordinate, nearby_connector_id } = nearby_access_point;

  // approaches:
  // 1. get both ends of nearby_connector and connector data
  // 2. connect nearby_coordinate to the ends making 2 new connectors
  // 3. get properties of 2 connectors using the original nearby connector data
  // 4. remove nearby_connector and its alternative if available

  // 1. get both ends of nearby_connector and connector data
  const [sourceID, targetID] = nearby_connector_id.split(",");

  const connector = connectors[nearby_connector_id];

  const { source_lat, source_lon, target_lat, target_lon, distance, duration, n_distance, n_duration } = connector;
  const [point_lat, point_lon] = nearby_coordinate;

  // 2. connect nearby_coordinate to the ends making 2 new connectors
  const point_target_id = `${point_name},${targetID}`;

  // 3. get properties of 2 connectors using the original nearby connector data
  const point_target_euclidean_distance = calculate_euclidean_distance(point_lat, point_lon, target_lat, target_lon);
  const source_target_euclidean_distance = calculate_euclidean_distance(source_lat, source_lon, target_lat, target_lon);

  const new_distance = (point_target_euclidean_distance / source_target_euclidean_distance) * distance;
  const new_duration = (point_target_euclidean_distance / source_target_euclidean_distance) * duration;
  const new_n_distance = (point_target_euclidean_distance / source_target_euclidean_distance) * n_distance;
  const new_n_duration = (point_target_euclidean_distance / source_target_euclidean_distance) * n_duration;

  const point_target_geometry = search_geometry(source_lat, source_lon, point_lat, point_lon);
  connectors[point_target_id] = {
    ...connector,
    ...{
      distance: new_distance,
      duration: new_duration,
      n_distance: new_n_distance,
      n_duration: new_n_duration,
      geometry: point_target_geometry,
      source_lat: point_lat,
      source_lon: point_lon,
      source_node_id: point_name,
    },
  };

  const alt_connector = connectors[`${targetID},${sourceID}`];

  if (alt_connector) {
    const target_point_id = `${targetID},${point_name}`;
    const target_point_geometry = search_geometry(target_lat, target_lon, point_lat, point_lon);
    connectors[target_point_id] = {
      ...alt_connector,
      ...{
        target_lat: point_lat,
        target_lon: point_lon,
        target_node_id: point_name,
        geometry: target_point_geometry,
        distance: new_distance,
        duration: new_duration,
        n_distance: new_n_distance,
        n_duration: new_n_duration,
      },
    };
  }

  return connectors;
}

function get_merge_order(start_access_points, finish_access_points, connectors) {
  const { nearby_coordinate: start_coordinate, nearby_connector_id } = start_access_points;
  const { nearby_coordinate: finish_coordinate } = finish_access_points;

  const connector = connectors[nearby_connector_id];

  const { source_lat, source_lon, target_lat, target_lon, source_node_id, target_node_id } = connector;

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

function insert_start_finish(start_access_points, finish_access_points, connectors) {
  const { nearby_coordinate: start_coordinate, nearby_connector_id } = start_access_points;
  const { nearby_coordinate: finish_coordinate } = finish_access_points;

  const [start_lat, start_lon] = start_coordinate;
  const [finish_lat, finish_lon] = finish_coordinate;

  const connector = connectors[nearby_connector_id];

  const { source_node_id, target_node_id, distance, duration, source_lat, target_lat, source_lon, target_lon, n_distance, n_duration } = connector;

  const start_finish_id = "start,finish";

  const start_finish_euclidean_distance = calculate_euclidean_distance(start_lat, start_lon, finish_lat, finish_lon);
  const source_target_euclidean_distance = calculate_euclidean_distance(source_lat, source_lon, target_lat, target_lon);

  const new_distance = (start_finish_euclidean_distance / source_target_euclidean_distance) * distance;
  const new_duration = (start_finish_euclidean_distance / source_target_euclidean_distance) * duration;
  const new_n_distance = (start_finish_euclidean_distance / source_target_euclidean_distance) * n_distance;
  const new_n_duration = (start_finish_euclidean_distance / source_target_euclidean_distance) * n_duration;

  const start_finish_geometry = search_geometry(start_lat, start_lon, finish_lat, finish_lon);
  connectors[start_finish_id] = {
    ...connector,
    ...{
      distance: new_distance,
      duration: new_duration,
      n_distance: new_n_distance,
      n_duration: new_n_duration,
      geometry: start_finish_geometry,
      source_lat: start_lat,
      source_lon: start_lon,
      target_lat: finish_lat,
      target_lon: finish_lon,
      source_node_id: "start",
      target_node_id: "finish",
    },
  };

  const alt_connector = connectors[`${target_node_id},${source_node_id}`];

  if (alt_connector) {
    const finish_start_id = "finish_start";
    const finish_start_geometry = search_geometry(finish_lat, finish_lon, start_lat, start_lon);
    connectors[finish_start_id] = {
      ...alt_connector,
      ...{
        distance: new_distance,
        duration: new_duration,
        n_distance: new_n_distance,
        n_duration: new_n_duration,
        geometry: finish_start_geometry,
        source_lat: finish_lat,
        source_lon: finish_lon,
        target_lat: start_lat,
        target_lon: start_lon,
        source_node_id: "finish",
        target_node_id: "start",
      },
    };
  }

  return connectors;
}

function merge_connectors(start_access_points, finish_access_points, connectors) {
  // approaches:
  // 1. search which node is nearest to its end

  const merge_order = get_merge_order(start_access_points, finish_access_points, connectors);

  if (merge_order[1] === "start") {
    connectors = insert_source_point(start_access_points, connectors, "start");
    connectors = insert_point_target(finish_access_points, connectors, "finish");
  } else {
    connectors = insert_source_point(finish_access_points, connectors, "finish");
    connectors = insert_point_target(start_access_points, connectors, "start");
  }

  connectors = insert_start_finish(start_access_points, finish_access_points, connectors);

  return connectors;
}

function remove_connectors(nearby_access_point, connectors) {
  const { nearby_connector_id } = nearby_access_point;
  const [sourceID, targetID] = nearby_connector_id.split(",");

  delete connectors[`${sourceID},${targetID}`];
  delete connectors[`${targetID},${sourceID}`];

  return connectors;
}

function modify_connectors(start_access_points, finish_access_points, connectors) {
  if (start_access_points.nearby_connector_id === finish_access_points.nearby_connector_id) {
    connectors = merge_connectors(start_access_points, finish_access_points, connectors);
    connectors = remove_connectors(start_access_points, connectors);
  } else {
    connectors = insert_source_point(start_access_points, connectors, "start");
    connectors = insert_point_target(start_access_points, connectors, "start");

    connectors = insert_source_point(finish_access_points, connectors, "finish");
    connectors = insert_point_target(finish_access_points, connectors, "finish");

    connectors = remove_connectors(start_access_points, connectors);
    connectors = remove_connectors(finish_access_points, connectors);
  }

  return connectors;
}

module.exports = modify_connectors;
