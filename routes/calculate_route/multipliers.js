function set_multiplier(priorities_input) {
  function get_multiplier_from_index(priority_index) {
    if (priority_index + 1 === 1) return 50;
    if (priority_index + 1 === 2) return 30;
    if (priority_index + 1 === 3) return 15;
    if (priority_index + 1 === 4) return 5;
  }

  let distance_multiplier, duration_multiplier, condition_multiplier, traffic_multiplier;
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
  }

  for (const [index, value] of priorities_input.entries()) {
    get_multiplier(value, index);
  }

  return {
    distance_multiplier,
    duration_multiplier,
    condition_multiplier,
    traffic_multiplier,
  };
}

module.exports = set_multiplier;
