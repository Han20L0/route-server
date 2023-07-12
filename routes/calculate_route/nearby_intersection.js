const { connection, mysql_query } = require("../../mysql");

async function search_nearby_nodes(input_coordinates, boundings) {
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

function search_nearby_nodes_by_intersection(intersections, nearby_nodes) {
  for (const nearby_node of nearby_nodes) {
    const nearby_id = nearby_node.id;

    for (const intersectionID in intersections) {
      const { connector_list, source_node_id, target_node_id, via_way_id } = intersections[intersectionID];

      if (parseInt(source_node_id) === parseInt(nearby_id)) {
        return [source_node_id];
      }

      if (parseInt(target_node_id) === parseInt(nearby_id)) {
        return [target_node_id];
      }

      if (JSON.stringify(connector_list).includes(nearby_id)) {
        return [source_node_id, target_node_id];
      }
    }

    console.log(`not found nearby for ${nearby_id}`);
  }
}

module.exports = { search_nearby_nodes, search_nearby_nodes_by_intersection };
