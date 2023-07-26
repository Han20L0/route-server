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
      classes: source_node_id === "start" || source_node_id === "finish" ? "selected" : "",
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
  constructor(node, cost, parentNode) {
    this.node = node;
    this.cost = cost;
    this.parent = parentNode;
  }
}
class PriorityQueue {
  constructor() {
    this.queArr = [];
    this.visitedNodes = new Set();
  }
  enqueue(node, cost, parentNode) {
    let queueElem = new QueueElement(node, cost, parentNode);
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
    const elem = this.queArr.shift();

    this.visitedNodes.add(elem.node);
    return elem;
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
  alreadyVisit() {
    return this.visitedNodes;
  }
}

const dijkstra = (graph) => {
  const nodeCost = { start: { start: 0 } };
  const nodeParent = {};

  const priorityQueue = new PriorityQueue();

  for (node in graph) {
    nodeCost[node] = Infinity;
  }

  for (const child in graph["start"]) {
    priorityQueue.enqueue(child, graph["start"][child], "start");
  }

  console.log(priorityQueue.queArr);

  let count = 0;

  while (!priorityQueue.isEmpty() && !priorityQueue.alreadyVisit().has("finish")) {
    const { node, cost, parent } = priorityQueue.dequeue();

    if (cost < nodeCost[node]) {
      nodeCost[node] = cost;
      nodeParent[node] = parent;

      for (const child in graph[node]) {
        if (child === "start") continue;

        const childCost = cost + graph[node][child];

        priorityQueue.enqueue(child, childCost, node);
      }
    }

    count++;
  }

  console.log(count);

  let current = "finish";

  let pathString = "finish";

  let pathFound = false;
  let path = ["finish"];
  while (current !== "start" && current !== undefined) {
    const node = nodeParent[current];

    path.push(node);

    pathString += ` <- ${node}`;
    current = node;

    if (current === "start") {
      pathFound = true;
    }
  }

  path.reverse();

  const cost = nodeCost["finish"];

  return { cost, path, found: pathFound };
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
  let { cost, path, found } = dijkstra(graph);
  // console.log(path);

  return { cost, path, found };
}

module.exports = search_shortest_path;
