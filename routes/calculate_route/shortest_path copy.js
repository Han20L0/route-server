const fs = require("fs");

const create_sim_file = (graph, intersections) => {
  let ids = [];

  const nodes = [];
  let count = 0;
  for (const intersectionID in intersections) {
    const { source_lat, source_lon, source_node_id, target_node_id } = intersections[intersectionID];

    if (ids.includes(source_node_id)) continue;

    nodes.push({
      data: {
        id: source_node_id,
      },
      position: {
        x: (source_lon - 107.5249) * 1000000,
        y: (source_lat + 6.9926) * 1000000,
      },
      group: "nodes",
      removed: false,
      selected: false,
      selectable: true,
      locked: false,
      grabbable: true,
      classes: intersectionID.includes("start") || intersectionID.includes("finish") ? "selected" : "",
    });

    ids.push(source_node_id);
  }

  count = 0;
  const edges = [];
  for (const intersectionID in graph) {
    for (const target in graph[intersectionID]) {
      edges.push({
        data: {
          id: `${intersectionID}-${target}`,
          source: intersectionID,
          target: target,
          weight: graph[intersectionID][target].toFixed(2),
        },
        group: "edges",
      });
    }
  }

  const frame = {
    elements: {
      nodes,
      edges,
    },
  };

  fs.writeFileSync("./simulation/data/frame1.json", JSON.stringify(frame));
};

// priority queue from: https://www.tutorialspoint.com/The-Priority-Queue-in-Javascript
class QueueElement {
  constructor(elem, cost) {
    this.element = elem;
    this.cost = cost;
  }
}
class PriorityQueue {
  constructor() {
    this.queArr = [];
  }
  enqueue(elem, cost) {
    let queueElem = new QueueElement(elem, cost);
    let contain = false;
    for (let i = 0; i < this.queArr.length; i++) {
      if (this.queArr[i].cost > queueElem.cost) {
        this.queArr.splice(i, 0, queueElem);
        contain = true;
        break;
      }
    }
    if (!contain) {
      this.queArr.push(queueElem);
    }
  }
  dequeue() {
    if (this.isEmpty()) return "Underflow";
    return this.queArr.shift();
  }
  front() {
    if (this.isEmpty()) return "The Queue is Empty..!";
    return this.queArr[0];
  }
  rear() {
    if (this.isEmpty()) return "The Queue is Empty..!";
    return this.queArr[this.queArr.length - 1];
  }
  isEmpty() {
    return this.queArr.length == 0;
  }
}

const dijkstra = (graph) => {
  const costs = { start: { start: 0 } };
  const priorityQueue = new PriorityQueue();

  for (node in graph) {
    costs[node] = Infinity;
  }

  const parent = {};

  for (const child in graph["start"]) {
    costs[child] = graph["start"][child];
    parent[child] = "start";

    priorityQueue.enqueue(child, graph["start"][child]);
  }

  let count = 0;

  console.log(priorityQueue.queArr);

  while (!priorityQueue.isEmpty()) {
    const el = priorityQueue.dequeue();
    const node = el.element;

    for (const child in graph[node]) {
      if (child === "start") continue;

      if (graph[node][child] + costs[node] < costs[child]) {
        costs[child] = graph[node][child] + costs[node];
        parent[child] = node;

        for (const target in graph[child]) {
          priorityQueue.enqueue(target, graph[child][target] + costs[child]);
        }
      }
    }

    console.log(parent);

    count++;
  }

  console.log(count);

  let current = "finish";

  let pathString = "finish";

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
  create_sim_file(graph, intersections);

  // 2. calculate shortest path using dijktra's algorithm
  let { cost, path } = dijkstra(graph);
  // console.log(path);

  return { cost, path };
}

module.exports = search_shortest_path;
