function get_intersection_value(connectors, connector_list) {
  connector_list = JSON.parse(connector_list);

  // calculate total distance and n_distance
  let total_distance = 0,
    total_n_distance = 0;

  let total_duration = 0,
    total_n_duration = 0;

  let traffic_total = 0,
    quality_total = 0;

  let connector_count = connector_list.length;

  for (const connectorID of connector_list) {
    if (connectors[connectorID]) {
      const { distance, duration, n_distance, n_duration, traffic: current_traffic, n_condition } = connectors[connectorID];

      total_distance += distance;
      total_n_distance += n_distance;
      total_duration += duration;
      total_n_duration += n_duration;
      traffic_total += current_traffic / 2 || 0;
      quality_total += n_condition;
    } else {
      // console.log(connectorID);

      // if connectorID is unknown, set values to infinity, because it means the connector is out of bound and should not be calculated
      total_distance = Infinity;
      total_n_distance = Infinity;
      total_duration = Infinity;
      total_n_duration = Infinity;
      traffic_total = Infinity;
      quality_total = Infinity;
    }
  }

  return {
    distance: total_distance,
    duration: total_duration,
    n_distance: total_n_distance,
    n_duration: total_n_duration,
    avg_traffic: traffic_total / connector_count,
    avg_quality: quality_total / connector_count,
  };
}

function connect_intersection_with_connectors(intersections, connectors) {
  // connect intersections with their connectors via connector_list
  // with adding traffic and condition value

  for (const intersectionID in intersections) {
    const { connector_list } = intersections[intersectionID];

    intersections[intersectionID].values = get_intersection_value(connectors, connector_list);
  }

  return intersections;
}

function weigh_intersections(intersections, multipliers) {
  // approaches:
  // 1. iterate every intersections
  // 3. retrieve all intersection normalized properties (i.e. n_distances, n_durations, etc)
  // 4. multiply each property with multipliers
  // 5. set total cost

  const { distance_multiplier, duration_multiplier, condition_multiplier, traffic_multiplier } = multipliers;

  for (const intersectionID in intersections) {
    const { n_distance, n_duration, avg_traffic, avg_quality } = intersections[intersectionID].values;

    const cost =
      n_distance * distance_multiplier + n_duration * duration_multiplier + avg_quality * condition_multiplier + avg_traffic * traffic_multiplier;

    intersections[intersectionID].cost = cost;
  }

  return intersections;
}

function remove_duplicated(intersections) {
  let filtered_intersections = {};

  const duplicated_intersectionID = {};

  for (const intersectionID in intersections) {
    const [sourceID, targetID, via_way_id] = intersectionID.split(",");

    if (!duplicated_intersectionID[`${sourceID},${targetID}`]) {
      duplicated_intersectionID[`${sourceID},${targetID}`] = [];
    }

    duplicated_intersectionID[`${sourceID},${targetID}`].push(intersectionID);
  }

  for (const duplicated_id in duplicated_intersectionID) {
    if (duplicated_intersectionID[duplicated_id].length < 2) {
      filtered_intersections[duplicated_id] = intersections[duplicated_intersectionID[duplicated_id][0]];
    } else {
      let best_cost = Infinity;
      let best_ID = "";

      for (const duplicated of duplicated_intersectionID[duplicated_id]) {
        const { cost } = intersections[duplicated];

        if (cost < best_cost) {
          best_cost = cost;
          best_ID = duplicated;
        }
      }

      filtered_intersections[duplicated_id] = intersections[best_ID];
    }
  }

  return filtered_intersections;
}

function set_intersection_cost(intersections, connectors, multipliers) {
  const conneted_intersections = connect_intersection_with_connectors(intersections, connectors);
  const weighted_intersections = weigh_intersections(conneted_intersections, multipliers);

  // remove duplicated source_end intersections
  const filtered_intersections = remove_duplicated(weighted_intersections);

  return filtered_intersections;
}

function set_connectors_cost(connectors, multipliers) {
  const { distance_multiplier, duration_multiplier, condition_multiplier, traffic_multiplier } = multipliers;

  for (const connectorID in connectors) {
    const { n_distance, n_duration, n_traffic, n_condition } = connectors[connectorID];

    connectors[connectorID].cost =
      n_distance * distance_multiplier + n_duration * duration_multiplier + n_traffic * traffic_multiplier + n_condition * condition_multiplier;
  }

  return connectors;
}

module.exports = { set_intersection_cost, set_connectors_cost };
