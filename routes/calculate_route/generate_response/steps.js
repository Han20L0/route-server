function get_angle_name(angleDeg) {
  let angle_name = "";

  if (angleDeg >= -22.5 && angleDeg <= 22.5) {
    angle_name = "north";
  } else if (angleDeg >= 22.5 && angleDeg <= 67.5) {
    angle_name = "northeast";
  } else if (angleDeg >= 67.5 && angleDeg <= 112.5) {
    angle_name = "east";
  } else if (angleDeg >= 112.5 && angleDeg <= 157.5) {
    angle_name = "southeast";
  } else if (angleDeg >= -157.5 && angleDeg <= -112.5) {
    angle_name = "southwest";
  } else if (angleDeg >= -112.5 && angleDeg <= -67.5) {
    angle_name = "west";
  } else if (angleDeg >= -67.5 && angleDeg <= -22.5) {
    angle_name = "northwest";
  } else if (angleDeg >= 157.5 || angleDeg <= -157.5) {
    angle_name = "south";
  }

  return angle_name;
}

function get_angle_with_name(lat1, lon1, lat2, lon2) {
  lat1 = parseFloat(lat1);
  lat2 = parseFloat(lat2);
  lon1 = parseFloat(lon1);
  lat2 = parseFloat(lat2);

  // reference: via https://gist.github.com/conorbuck/2606166
  // the result angle will between -180 to 180 deg
  var angleDeg = (Math.atan2(lon2 - lon1, lat2 - lat1) * 180) / Math.PI;

  const angle_name = get_angle_name(angleDeg);

  return { angle_degree: angleDeg, angle_name };
}

function get_fixed_distance(distance) {
  distance = Math.floor(distance);

  let unit = "meters";

  if (distance >= 1000) {
    unit = "kilometers";
    distance /= 1000;
  }

  return { unit, distance };
}

function generate_first_step(angle, distance, duration, source, target) {
  // approaches:
  // 1. get waypoints angle
  // 2. add properties

  const { distance: fixed_distance, unit } = get_fixed_distance(distance);

  const angle_name = get_angle_name(angle);

  return {
    text: `drive ${angle_name} for ${fixed_distance} ${unit}`,
    distance,
    duration,
    code: `drive:${angle_name}(${angle})`,
    source,
    target,
  };
}

function generate_next_step(next_turn, distance, duration, source, target) {
  const { distance: fixed_distance, unit } = get_fixed_distance(distance);

  return {
    text: `turn ${next_turn} and forward for ${fixed_distance} ${unit}`,
    distance,
    duration,
    code: `turn:${next_turn}`,
    source,
    target,
  };
}

function generate_next_steps(paths, intersections, connectors) {
  const steps = [];

  // approaches:
  // 1. get intersections info of each path to another
  // 2. get check if intersection angle is significantly differs with last intersection
  // 2a. if it's roughly the same, then stack the distance & duration info
  // 2b. if it's changing, then get the distance & duration (+ stacked info if any)
  // 3. return step details

  const connector_steps = [];

  for (let pathIdx = 0; pathIdx < paths.length - 1; pathIdx++) {
    const intersectionID = `${paths[pathIdx]},${paths[pathIdx + 1]}`;
    const { connector_list } = intersections[intersectionID];

    for (const connectorID of JSON.parse(connector_list)) {
      connector_steps.push(connectorID);
    }
  }

  let stack_distance = 0,
    stack_duration = 0;

  let last_lat, last_lon;

  let last_angle;
  let prev_angle = undefined;
  let current_angle;

  let next_turn;

  function set_next_turn(prev_angle, curr_angle, is_out) {
    if (is_out) {
      if (prev_angle > curr_angle) {
        next_turn = "right";
      } else if (prev_angle < curr_angle) {
        next_turn = "left";
      }
    } else {
      if (prev_angle > curr_angle) {
        next_turn = "left";
      } else if (prev_angle < curr_angle) {
        next_turn = "right";
      }
    }
  }

  for (const connectorID of connector_steps) {
    const connector = connectors[connectorID];
    const { source_lat, source_lon, target_lat, target_lon, distance, duration, neighbour_ids } = connector;

    current_angle = get_angle_with_name(source_lat, source_lon, target_lat, target_lon).angle_degree;

    if (!last_angle) {
      last_angle = current_angle;
      prev_angle = current_angle;

      last_lat = source_lat;
      last_lon = source_lon;

      stack_distance += distance;
      stack_duration += duration;
      continue;
    }

    let step;

    let angle_diff = Math.abs(current_angle - prev_angle);
    const is_out = Math.abs(current_angle - prev_angle) > 180;

    if (is_out) {
      angle_diff = Math.abs(360 - angle_diff);
    }

    if (angle_diff > 60 && stack_distance > 1 && JSON.parse(neighbour_ids).length > 2) {
      if (steps.length === 0) {
        step = generate_first_step(prev_angle, stack_distance, stack_duration, `${last_lon},${last_lat}`, `${source_lon},${source_lat}`);

        set_next_turn(prev_angle, current_angle, is_out);
      } else {
        step = generate_next_step(next_turn, stack_distance, stack_duration, `${last_lon},${last_lat}`, `${source_lon},${source_lat}`);
        set_next_turn(prev_angle, current_angle, is_out);
      }

      last_angle = current_angle;
      last_lat = source_lat;
      last_lon = source_lon;

      stack_distance = distance;
      stack_duration = duration;

      steps.push(step);
    } else {
      stack_distance += distance;
      stack_duration += duration;
    }

    prev_angle = current_angle;
  }

  if (stack_distance > 0) {
    let step;
    if (steps.length > 0) {
      step = generate_next_step(next_turn, stack_distance, stack_duration);
    } else {
      step = generate_first_step(prev_angle, stack_distance, stack_duration);
    }
    steps.push(step);
  }

  return steps;
}

function generate_steps(paths, intersections, connectors) {
  // approaches:
  // 1. generate first step
  // 2. generate the other steps

  const steps = generate_next_steps(paths, intersections, connectors);

  return steps;
}

module.exports = generate_steps;
