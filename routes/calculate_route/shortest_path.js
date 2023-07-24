const dijkstra = (graph) => {
  const costs = { start: { start: 0 } };

  for (node in graph) {
    costs[node] = Infinity;
  }

  const queue = [];
  const parent = {};

  for (child in graph["start"]) {
    queue.push(child);
    costs[child] = graph["start"][child];
    parent[child] = "start";
  }

  let count = 0;

  while (queue.length > 0) {
    const node = queue.shift();
    for (child in graph[node]) {
      if (child === "start") continue;

      if (graph[node][child] + costs[node] < costs[child]) {
        queue.push(child);
        costs[child] = graph[node][child] + costs[node];
        parent[child] = node;
      }
    }
  }
  console.log(parent);

  let current = "finish";

  let pathString = "finish";

  console.log(parent["10981995426"]);

  let path = ["finish"];
  while (current !== "start" && current !== undefined) {
    const node = parent[current];

    path.push(node);

    pathString += ` <- ${node}`;
    current = node;
  }

  path.reverse();

  const cost = costs["finish"];

  return { cost, path };
};

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
    try {
      const { source_node_id, target_node_id, cost } = intersections[intersectionID];

      add_edge(source_node_id, target_node_id, cost);
    } catch (e) {}
  }

  return graph;
}

function search_shortest_path(intersections) {
  // with 2 source and 2 targets, the algorithm will used 4 times
  // approaches:
  // 1. create graph of nodes and vertices
  // 2. calculate shortest path using dijktra's algorithm

  // 1. create graph of nodes and vertices
  const graph = create_graph(intersections);

  // 2. calculate shortest path using dijktra's algorithm
  let { cost, path } = dijkstra(graph);
  // console.log(path);

  return { cost, path };
}

module.exports = search_shortest_path;
