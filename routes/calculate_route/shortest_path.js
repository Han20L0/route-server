// function search_shortest_path_dijkstra(graph, startID, endID) {
//   const dijkstra_costs = {};

//   // set initial values
//   for (const nodeID in graph) {
//     if (nodeID === startID) {
//       dijkstra_costs[startID] = 0;
//     } else {
//       dijkstra_costs[nodeID] = Infinity;
//     }
//   }

//   const visited_nodes =
// }

// reference: modified from https://hackernoon.com/how-to-implement-dijkstras-algorithm-in-javascript-abdfd1702d04
const lowestCostNode = (costs, processed) => {
  return Object.keys(costs).reduce((lowest, node) => {
    if (lowest === null || costs[node] < costs[lowest]) {
      if (!processed.includes(node)) {
        lowest = node;
      }
    }

    return lowest;
  }, null);
};

// function that returns the minimum cost and path to reach Finish
const dijkstra = (graph) => {
  // track lowest cost to reach each node
  const costs = Object.assign({ finish: Infinity }, graph.start);

  // track paths
  const parents = { finish: null };
  for (let child in graph.start) {
    parents[child] = "start";
  }

  // track nodes that have already been processed
  const processed = [];

  let node = lowestCostNode(costs, processed);

  while (node) {
    let cost = costs[node];
    let children = graph[node];
    for (let n in children) {
      let newCost = cost + children[n];
      if (parents[node] === n) continue;
      if (!costs[n]) {
        costs[n] = newCost;
        parents[n] = node;
      }
      if (costs[n] > newCost) {
        costs[n] = newCost;
        parents[n] = node;
      }
    }

    processed.push(node);
    node = lowestCostNode(costs, processed);
  }

  let optimalPath = ["finish"];
  let parent = parents.finish;

  while (parent) {
    optimalPath.push(parent);
    parent = parents[parent];
  }
  optimalPath.reverse();

  const results = {
    cost: costs.finish,
    path: optimalPath,
  };

  return results;
};

function recreate_graph(graph, sourceID, targetID) {
  const graph_copy = Object.assign({}, graph);

  const start = graph_copy[sourceID];
  const finish = graph_copy[targetID];

  graph_copy["start"] = start;
  graph_copy["finish"] = finish;

  // console.log(graph_copy[sourceID], graph_copy["start"]);

  delete graph_copy[sourceID];
  delete graph_copy[targetID];

  for (const nodeID in graph_copy) {
    try {
      if (graph_copy[nodeID][targetID]) {
        graph_copy[nodeID]["finish"] = graph_copy[nodeID][targetID];
        delete graph_copy[nodeID][targetID];
      }
    } catch (e) {
      // console.log(nodeID, targetID);
      // console.log(graph_copy[nodeID]);
    }
  }

  return graph_copy;
}

function search_shortest_path(graph, sources, targets) {
  // with 2 source and 2 targets, the algorithm will used 4 times
  // approaches:
  // 1.break sources to 2 sourceIDs
  // 1.break targets to 2 targetIDs
  // 2. perform dijkstra's algorithm for each combination
  // 3. get 2 solutions with lowest cost

  let best_cost = Infinity,
    alternate_cost = Infinity;
  let best_source, alternate_source;
  let best_target, alternate_target;
  let best_path, alternate_path;

  for (const sourceID of sources) {
    for (const targetID of targets) {
      const recreated_graph = recreate_graph(graph, sourceID, targetID);

      const { cost, path } = dijkstra(recreated_graph);

      if (cost < best_cost) {
        alternate_cost = best_cost;
        alternate_path = best_path;
        alternate_source = best_source;
        alternate_target = best_target;

        best_cost = cost;
        best_path = path;
        best_source = sourceID;
        best_target = targetID;
      } else if (cost < alternate_cost && cost !== best_cost) {
        alternate_cost = cost;
        alternate_path = path;
        alternate_source = sourceID;
        alternate_target = targetID;
      }
    }
  }

  console.log({ best_path, best_cost, alternate_path, alternate_cost });
  console.log({ best_source, best_target, alternate_source, alternate_target });
  console.log(best_path.length, alternate_path.length);

  // return { best_path, best_cost, alternate_path, alternate_cost };
}

module.exports = search_shortest_path;
