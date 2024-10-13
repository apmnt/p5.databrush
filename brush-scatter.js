function setup() {
  commonSetup();

  let plotData1 = getRandomData(50, 0, 10);
  let plotData2 = getRandomData(50, 5, 15);
  let plotData3 = getRandomData(50, 0, 10);
  let plotData4 = getRandomData(50, 0, 10);
  drawGrid(plotData1);
  const plotRange = [
    { x: -50, y: -50 },
    { x: 50, y: 50 },
  ];

  // Pass plotRange as the third argument to drawScatterPlot
  drawScatterPlot(plotData1, (colors = "#7facc6"));
}

function draw() {}
