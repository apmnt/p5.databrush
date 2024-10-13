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

function drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight) {
  textAlign(CENTER, CENTER);
  textSize(12);

  brush.line(0, plotHeight, plotWidth * 1.05, plotHeight); // x-axis

  const numTicksX = Math.round((niceMaxX - niceMinX) / niceTickX);
  for (let i = 0; i <= numTicksX; i++) {
    const value = niceMinX + i * niceTickX;
    const x = ((value - niceMinX) / (niceMaxX - niceMinX)) * plotWidth;
    text(value.toFixed(1), x, plotHeight + 10);
    brush.line(x, -plotHeight * 0.05, x, plotHeight);
  }
}

function drawYScale(niceMinY, niceMaxY, niceTickY, plotWidth, plotHeight) {
  textAlign(RIGHT, CENTER);
  textSize(12);

  const numTicksY = Math.round((niceMaxY - niceMinY) / niceTickY);
  for (let i = 0; i <= numTicksY; i++) {
    const value = niceMinY + i * niceTickY;
    const y =
      plotHeight - ((value - niceMinY) / (niceMaxY - niceMinY)) * plotHeight;
    text(value.toFixed(1), -10, y);
    brush.line(0, y, plotWidth * 1.05, y);
  }
}

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
