const { connection, mysql_query } = require("../../mysql");

async function search_nearby_intersection_nodes(input_coordinates, boundings) {
  // returns 2 nearby intersection nodes with input coordinates is between those
  // example input_coordinates (lat): -6.905
  // nearby1 (lat) must be > -6.905 and nearby2(lat) must be < -6.905
  // note: can be horizontally, vertically, or both

  // approaches:
  // 1. get latitude and longitude of input coordinates
  // 2. get boundings
  // 4. perform mysql query:
  // - get source_node_id from tb_intersection and lat,lon from tb_nodes
  // - create distance column using calculation of euclidean distance of input_coordinates and intersection_coordinates
  // - restrict lat and lon ranges using boundings
  // - return results
  // 6. set first nearest intersection node and second nearest by same via_way_id as first nearest
  // - check if intersection node is left/right and up/down from input coordinates
  // - filter results based on left/right and up/down information
  // - get for other nearest node
  // 7. return two nearest intersection node IDs

  // 1. get latitude and longitude of input coordinates
  const sourceLat = input_coordinates[0],
    sourceLon = input_coordinates[1];

  // 2. get boundings
  const { west, east, south, north } = boundings;

  // 4. perform mysql query:
  // - get source_node_id from tb_intersection and lat,lon from tb_nodes
  // - create distance column using calculation of euclidean distance of input_coordinates and intersection_coordinates
  // - restrict lat and lon ranges using boundings
  const distanceQuery = `SQRT(POW((nodes.lat - ${sourceLat}), 2) + POW((nodes.lon - ${sourceLon}), 2))`;
  const restrictQuery = `nodes.lat < ${north} AND nodes.lat > ${south} AND nodes.lon > ${west} AND nodes.lon < ${east}`;
  const query = `SELECT DISTINCT(intersection.source_node_id), intersection.via_way_id, nodes.lat, nodes.lon, ${distanceQuery} AS distance
                FROM tb_nodes AS nodes, tb_intersections AS intersection
                WHERE nodes.id = intersection.source_node_id AND ${restrictQuery}
                ORDER BY distance ASC;`;

  let results = await mysql_query(query);

  // 6. set first nearest intersection node and second nearest by same via_way_id as first nearest
  const nearest_node = results[0];
  results.shift();

  // - check if intersection node is left/right and up/down from input coordinates
  let nearest_is_left = true,
    nearest_is_up = true;

  const { lat: nearest_lat, lon: nearest_lon } = nearest_node;
  if (nearest_lon > sourceLon) nearest_is_left = false;
  if (nearest_lat < sourceLat) nearest_is_up = false;

  // - filter results based on left/right and up/down information
  results = results.filter((result) => {
    if (result.via_way_id !== nearest_node.via_way_id) return;

    let nearest2_is_left = true,
      nearest2_is_up = true;

    const { lat, lon } = result;
    if (lon > sourceLon) nearest2_is_left = false;
    if (lat < sourceLat) nearest2_is_up = false;

    if (nearest_is_left !== nearest2_is_left || nearest_is_up !== nearest2_is_up) {
      return result;
    }
  });

  // - get for other nearest node
  const second_nearest_intersection_node = results[0];

  // 7. return two nearest intersection node IDs
  return [nearest_node.source_node_id, second_nearest_intersection_node.source_node_id];
}

module.exports = search_nearby_intersection_nodes;
