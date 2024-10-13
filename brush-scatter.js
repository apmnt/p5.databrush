function setup() {
  commonSetup();
  randomizeData();

  drawGrid(plotData);
  drawScatterPlot(plotData);
}

function draw() {}

let plotData = [];
let pointSizes = [];
let colorValues = [];
let useGroups = false;



function drawGrid(values) {
  // Draw x and y scales
  const { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY } =
    getNiceBounds(values);

  drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight);
  drawYScale(niceMinY, niceMaxY, niceTickY, plotWidth, plotHeight);
}

function drawScatterPlot(values) {
  const { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY } =
    getNiceBounds(values);

  // Plot points
  for (let i = 0; i < values.length; i++) {
    const point = values[i];
    // Map data coordinates to screen coordinates
    const x = map(point.x, niceMinX, niceMaxX, 0, plotWidth - 0);
    const y = map(point.y, niceMinY, niceMaxY, plotHeight - 0, 0);
    brush.fill(random(palette), random(60, 100));
    brush.bleed(random(0.01, 0.2));
    brush.fillTexture(0.55, 0.8);
    // brush.noStroke();
    brush.circle(x, y, random(10, 20));
  }
}

function randomizeData() {
  plotData = [];
  bound = 10;
  for (let i = 0; i < 51; i++) {
    plotData.push({
      x: random(-bound, bound),
      y: random(-bound, bound),
      //   x: i,
      //   y: i,
    });
  }
  pointSizes = [];
  colorValues = [];
}

function randomizeSizes() {
  pointSizes = [];
  for (let i = 0; i < plotData.length; i++) {
    pointSizes.push(random(4, 16));
  }
}

function randomizeColorValues() {
  colorValues = [];
  for (let i = 0; i < plotData.length; i++) {
    colorValues.push(random(0, 1));
  }
}

function toggleGroups() {
  useGroups = !useGroups;
}
