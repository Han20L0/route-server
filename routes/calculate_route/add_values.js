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
      const { distance, duration, n_distance, n_duration, current_traffic, condition_rating } = connectors[connectorID];

      total_distance += distance;
      total_n_distance += n_distance;
      total_duration += duration;
      total_n_duration += n_duration;
      traffic_total += (current_traffic - 1) / 3 || 0;
      quality_total += condition_rating;
    } else {
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

module.exports = connect_intersection_with_connectors;
