function create_graph(intersections) {
  // purpose: creating a graph containing node with its neigbors /w cost

  const graph = {};

  function add_edge(source, target, cost) {
    if (!graph[source]) {
      graph[source] = {};
    }

    graph[source][target] = cost;
  }

  for (const intersectionID in intersections) {
    const { source_node_id, target_node_id, cost } = intersections[intersectionID];
    add_edge(source_node_id, target_node_id, cost);
  }

  return graph;
}

module.exports = create_graph;
