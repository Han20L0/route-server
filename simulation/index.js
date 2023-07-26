async function readData() {
  let i = 1;
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

window.addEventListener("load", async function () {
  const dataFrame = await readData();

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
        },
      },
      {
        selector: "node.selected",
        style: {
          "background-color": "red",
          label: "data(id)",
          width: 40,
          height: 40,
        },
      },
      {
        selector: "node.selected.current",
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
    ],
    elements: dataFrame[0].elements,
  }));

  cy.fit(cy.$("#start, #finish"));
});
