const DATASET_DIR = `dataset_backup`;

// dataset source
const SOURCE_DIR = `${DATASET_DIR}\\source`;
const WAYS_PATH = `${SOURCE_DIR}\\ways.json`;
const NODES_PATH = `${SOURCE_DIR}\\nodes.json`;

// dataset node
const NODE_DIR = `${DATASET_DIR}\\node`;
const TRAFFIC_SIGNAL_NODES_PATH = `${NODE_DIR}\\traffic_signal_nodes.json`;

// dataset ways
const WAYS_DIR = `${DATASET_DIR}\\ways`;
const CONNECTOR_PATH = `${WAYS_DIR}\\connector.json`;

// dataset intersection
const INTERSECTION_DIR = `${DATASET_DIR}\\intersection`;
const INTERSECTIONS_PATH = `${INTERSECTION_DIR}\\intersections.json`;
const INTERSECTION_CONNECTOR = `${INTERSECTION_DIR}\\intersection_connector.json`;

// dataset distance & duration
const DISTANCE_DIR = `${DATASET_DIR}\\distance`;
const DISTANCE_PATH = `${DISTANCE_DIR}\\distance.json`;

// dataset geometry
const GEOMETRY_DIR = `${DATASET_DIR}\\geometry`;
const GEOMETRY_PATH = `${GEOMETRY_DIR}\\geometry.json`;

// google maps traffic
const TRAFFIC_RESULT_DIR = `${DATASET_DIR}\\traffic`;

// weather api data
const WEATHER_API_DATA_DIR = `${DATASET_DIR}\\weather\\data`;
const WEATHER_API_VALUES = `${DATASET_DIR}\\weather\\weather_value.json`;

module.exports = {
  DATASET_DIR,
  SOURCE_DIR,
  WAYS_PATH,
  NODES_PATH,
  NODE_DIR,
  TRAFFIC_SIGNAL_NODES_PATH,
  WAYS_DIR,
  CONNECTOR_PATH,
  INTERSECTION_DIR,
  INTERSECTIONS_PATH,
  INTERSECTION_CONNECTOR,
  DISTANCE_DIR,
  DISTANCE_PATH,
  GEOMETRY_DIR,
  GEOMETRY_PATH,
  TRAFFIC_RESULT_DIR,
  WEATHER_API_DATA_DIR,
  WEATHER_API_VALUES,
};
