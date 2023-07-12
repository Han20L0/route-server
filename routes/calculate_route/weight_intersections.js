function set_multiplier(priorities_input) {
  function get_multiplier_from_index(priority_index) {
    if (priority_index + 1 === 1) return 50;
    if (priority_index + 1 === 2) return 25;
    if (priority_index + 1 === 3) return 12.5;
    if (priority_index + 1 === 4) return 7.5;
    if (priority_index + 1 === 5) return 5;
  }

  let distance_multiplier, duration_multiplier, condition_multiplier, traffic_multiplier, straight_multiplier;
  function get_multiplier(priority_value, priority_index) {
    if (priority_value === 1) {
      distance_multiplier = get_multiplier_from_index(priority_index);
    }

    if (priority_value === 2) {
      duration_multiplier = get_multiplier_from_index(priority_index);
    }
    if (priority_value === 3) {
      condition_multiplier = get_multiplier_from_index(priority_index);
    }
    if (priority_value === 4) {
      traffic_multiplier = get_multiplier_from_index(priority_index);
    }
    if (priority_value === 5) {
      straight_multiplier = get_multiplier_from_index(priority_index);
    }
  }

  for (const [index, value] of priorities_input.entries()) {
    get_multiplier(value, index);
  }

  return {
    distance_multiplier,
    duration_multiplier,
    condition_multiplier,
    traffic_multiplier,
    straight_multiplier,
  };
}
// router.project-osrm.org/match/v1/car/107.594,-6.94865;107.593,-6.95214?steps=true&geometries=polyline6&overview=full&annotations=true

function set_intersection_costs(intersections, multipliers) {
  // approaches:
  // 1. iterate every intersections
  // 3. retrieve all intersection normalized properties (i.e. n_distances, n_durations, etc)
  // 4. multiply each property with multipliers
  // 5. set total cost

  const { distance_multiplier, duration_multiplier, condition_multiplier, traffic_multiplier, straight_multiplier } = multipliers;

  for (const intersectionID in intersections) {
    const { n_distance, n_duration, avg_traffic, avg_quality } = intersections[intersectionID].values;

    const cost =
      n_distance * distance_multiplier + n_duration * duration_multiplier + avg_quality * condition_multiplier + avg_traffic * traffic_multiplier;

    intersections[intersectionID].cost = cost + straight_multiplier;
    intersections[intersectionID].straight_cost = cost;
  }

  return intersections;
}

function weight_intersection(intersections, priorities_input) {
  // approaches:
  // 1. set weight multipliers from priorities input
  // 2. weight all intersections using multipliers

  // 1. set weight multiplier for priorities input
  const multipliers = set_multiplier(priorities_input);

  const costed_intersections = set_intersection_costs(intersections, multipliers);

  return { multipliers, costed_intersections };
}

module.exports = weight_intersection;
