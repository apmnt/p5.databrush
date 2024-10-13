function setup() {
  commonSetup();
  randomizeData();

  let plotData = randomizeData();
  drawGrid(plotData);
  drawScatterPlot(plotData);
}

function draw() {}
