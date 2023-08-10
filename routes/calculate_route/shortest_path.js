const fs = require("fs");

const SIM_ALLOWED = false;

const create_sim_file = (graph, intersections, count, currentNode, parents, costs, priorityQueue, multipliers) => {
  const allowed_ids = new Set();
  const { queArr, visitedNodes } = priorityQueue;

  for (const queue of queArr) {
    allowed_ids.add(queue.node);
  }

  for (const node of visitedNodes) {
    allowed_ids.add(node);
  }

  allowed_ids.add("start");
  allowed_ids.add("finish");

  let ids = [];
  const nodes = [];
  const intersectionList = {};

  const pathArray = [currentNode];
  let node = currentNode;

  while (node !== "start") {
    node = parents[node];
    pathArray.push(node);
  }

  const pathString = pathArray.reverse().join("->");

  for (const intersectionID in intersections) {
    let { source_lat, source_lon, source_node_id, target_node_id } = intersections[intersectionID];
    source_node_id += "";

    if (!allowed_ids.has(source_node_id)) continue;

    if (ids.includes(intersectionID)) continue;

    intersectionList[intersectionID] = intersections[intersectionID];

    let classes = "";
    if (source_node_id === "start" || source_node_id === "finish") {
      classes = "selected";
    }
    if (source_node_id === currentNode) {
      classes = "current";

      if (source_node_id === "start" || source_node_id === "finish") {
        classes = "current";
      }
    }

    if (ids.includes(source_node_id)) continue;

    nodes.push({
      data: {
        id: source_node_id,
      },
      position: {
        x: (source_lon - 107.5249) * 1500000,
        y: -(source_lat + 6.9926) * 1500000,
      },
      group: "nodes",
      removed: false,
      selected: false,
      selectable: true,
      locked: false,
      grabbable: true,
      classes: classes,
    });

    ids.push(intersectionID);
  }

  const edges = [];
  for (const intersectionID in graph) {
    if (!allowed_ids.has(intersectionID)) continue;
    for (const target in graph[intersectionID]) {
      edges.push({
        data: {
          id: `${intersectionID}->${target}`,
          source: intersectionID,
          target: target,
          weight: graph[intersectionID][target].toFixed(2),
        },
        group: "edges",
        classes: pathString.includes(`${intersectionID}->${target}`) ? "way" : "",
      });
    }
  }

  const frame = {
    elements: {
      nodes,
      edges,
    },
    parents,
    costs,
    priorityQueue,
    intersectionList,
    multipliers,
    currentNode,
    pathString,
  };

  fs.writeFileSync(`./simulation/data/frame${count}.json`, JSON.stringify(frame));
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
    this.visitedNodes = [];
  }
  enqueue(node, cost, parentNode) {
    let queueElem = new QueueElement(node, cost, parentNode);
    let contain = false;

    for (let i = 0; i < this.queArr.length; i++) {
      if (!contain) {
        if (this.queArr[i].cost > queueElem.cost) {
          this.queArr.splice(i, 0, queueElem);
          contain = true;
          continue;
        }
      }

      if (contain) {
        if (this.queArr[i].node === node) {
          this.queArr.splice(i, 1);
          break;
        }
      }
    }
    if (!contain) {
      this.queArr.push(queueElem);
    }
  }
  dequeue() {
    if (this.isEmpty()) return "Underflow";
    const elem = this.queArr.shift();

    if (!this.visitedNodes.includes(elem.node)) {
      this.visitedNodes.push(elem.node);
    }
    return elem;
  }
  isEmpty() {
    return this.queArr.length == 0;
  }
  alreadyVisit() {
    return this.visitedNodes;
  }
}

const dijkstra = (graph, intersections, multipliers) => {
  const nodeCost = { start: 0 };
  const nodeParent = {};

  const priorityQueue = new PriorityQueue();

  for (const child in graph["start"]) {
    priorityQueue.enqueue(child, graph["start"][child], "start");
  }

  priorityQueue.visitedNodes.push("start");

  let iterationCount = 0;

  while (!priorityQueue.isEmpty() && !priorityQueue.alreadyVisit().includes("finish")) {
    const { node: currentNode, cost, parent } = priorityQueue.dequeue();

    if (cost < nodeCost[currentNode] || !nodeCost[currentNode]) {
      nodeCost[currentNode] = cost;
      nodeParent[currentNode] = parent;

      for (const child in graph[currentNode]) {
        if (child === "start") continue;

        const childCost = cost + graph[currentNode][child];

        if (childCost < nodeCost[child] || nodeCost[child] === undefined) {
          priorityQueue.enqueue(child, childCost, currentNode);
        }
      }
    }

    if (SIM_ALLOWED) create_sim_file(graph, intersections, iterationCount, currentNode, nodeParent, nodeCost, priorityQueue, multipliers);
    iterationCount++;
  }

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

  return { cost, path, found: pathFound, iterationCount };
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

function deletePreviousSim() {
  if (!SIM_ALLOWED) return;
  try {
    let count = 0;
    let failed = false;
    while (true) {
      const fileName = `./simulation/data/frame${count++}.json`;
      if (fs.existsSync(fileName)) {
        fs.unlink(fileName, (err) => {});
      } else {
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }
}

function search_shortest_path(intersections, multipliers) {
  // with 2 source and 2 targets, the algorithm will used 4 times
  // approaches:
  // 1. create graph of nodes and vertices
  // 2. calculate shortest path using dijktra's algorithm

  // 1. create graph of nodes and vertices
  const graph = create_graph(intersections);
  deletePreviousSim();

  // 2. calculate shortest path using dijktra's algorithm
  let { cost, path, found, iterationCount } = dijkstra(graph, intersections, multipliers);
  // console.log(path);

  return { cost, path, found, iterationCount };
}

module.exports = search_shortest_path;
