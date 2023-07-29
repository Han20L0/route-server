async function readData() {
  let i = 0;
  let read = true;
  let dataFrames = [];
  while (read) {
    try {
      const res = await fetch(`./data/frame${i++}.json`);
      const frame = await res.json();
      dataFrames.push(frame);
    } catch (e) {
      read = false;
    }
  }

  return dataFrames;
}

function setGraph(elements) {
  var cy = (window.cy = cytoscape({
    container: document.getElementById("cy"),
    boxSelectionEnabled: false,
    autounselectify: true,
    hideEdgesOnViewport: true,
    textureOnViewport: true,
    layout: { name: "preset" },
    style: [
      {
        selector: "node",
        style: {
          "background-color": "#666",
          label: "data(id)",
          width: 20,
          height: 20,
        },
      },
      {
        selector: "node.selected",
        style: {
          "background-color": "red",
          label: "data(id)",
          width: 20,
          height: 20,
        },
      },
      {
        selector: "node.current",
        style: {
          "background-color": "purple",
          width: 20,
          height: 20,
          label: "data(id)",
        },
      },
      {
        selector: "node.current.selected",
        style: {
          "background-color": "purple",
          label: "data(id)",
        },
      },
      {
        selector: "edge",
        style: {
          "curve-style": "unbundled-bezier",
          width: 2,
          label: "data(weight)",
          "target-arrow-shape": "triangle",
          "line-color": "green",
          "target-arrow-color": "green",
        },
      },
      {
        selector: "edge.way",
        style: {
          "curve-style": "unbundled-bezier",
          width: 2,
          label: "data(weight)",
          "target-arrow-shape": "triangle",
          "line-color": "blue",
          "target-arrow-color": "blue",
        },
      },
    ],
    elements: elements,
  }));

  cy.fit(cy.$("#start, .current"), 200);
}

function setCurrentNode(currentNode, parents, costs) {
  const cost = costs[currentNode];
  const parent = parents[currentNode];

  const priorityQueueElement = document.getElementById("currentNode");
  priorityQueueElement.innerHTML = `
  <tr>
    <th>NodeID</th>
    <th>Cost</th>
    <th>Via</th>
  </tr>
  <tr>
    <td>${currentNode}</td>
    <td>${cost.toFixed(3)}</td>
    <td>${parent}</td>
  </tr>`;
}

function setPriorityQueue(priorityQueue) {
  let HTML = `<tr>
            <th>NodeID</th>
            <th>Cost</th>
            <th>Via</th>
          </tr>`;

  for (const queue of priorityQueue) {
    const { node, cost, parent } = queue;

    HTML += `<tr>
            <td>${node}</td>
            <td>${cost.toFixed(3)}</td>
            <td>${parent}</td>
          </tr>`;
  }

  const priorityQueueElement = document.getElementById("priorityQueue");
  priorityQueueElement.innerHTML = HTML;
}

function setVisitedNodes(visitedNodes, costs, parents) {
  let HTML = `<tr>
            <th>NodeID</th>
            <th>Cost</th>
            <th>Via</th>
          </tr>`;

  for (const node of visitedNodes) {
    const cost = costs[node],
      parent = parents[node];

    HTML += `<tr>
            <td>${node}</td>
            <td>${cost.toFixed(3)}</td>
            <td>${parent}</td>
          </tr>`;
  }

  const priorityQueueElement = document.getElementById("visitedNodes");
  priorityQueueElement.innerHTML = HTML;
}

function setData(dataFrames, currentFrame) {
  const {
    elements,
    currentNode,
    priorityQueue: { queArr, visitedNodes },
    costs,
    parents,
  } = dataFrames[currentFrame];

  setGraph(elements);
  setCurrentNode(currentNode, parents, costs);
  setPriorityQueue(queArr);
  setVisitedNodes(visitedNodes, costs, parents);
}

window.addEventListener("load", async function () {
  let currentFrame = 0;

  const dataFrames = await readData();
  console.log(dataFrames);

  setData(dataFrames, currentFrame);

  const frameInput = document.getElementById("frame");
  frameInput.setAttribute("max", dataFrames.length - 1);

  frameInput.addEventListener("change", (e) => {
    currentFrame = parseInt(e.target.value);
    setData(dataFrames, currentFrame);
  });
});
