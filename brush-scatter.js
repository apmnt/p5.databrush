let font;

function preload() {
  font = loadFont("/Inter.ttf");
}

const canvasSize = 1000;

const C = {
  loaded: false,
  prop() {
    return this.height / this.width;
  },
  isLandscape() {
    return window.innerHeight <= window.innerWidth * this.prop();
  },
  resize() {
    if (this.isLandscape()) {
      console.log("yes");
      document.getElementById(this.css).style.height = "100%";
      document.getElementById(this.css).style.removeProperty("width");
    } else {
      document.getElementById(this.css).style.removeProperty("height");
      document.getElementById(this.css).style.width = "100%";
    }
  },
  setSize(w, h, p, css) {
    (this.width = w), (this.height = h), (this.pD = p), (this.css = css);
  },
  createCanvas() {
    (this.main = createCanvas(this.width, this.height, WEBGL)),
      pixelDensity(this.pD),
      this.main.id(this.css),
      this.resize();
  },
};
C.setSize(canvasSize, canvasSize, 1, "mainCanvas");

function windowResized() {
  C.resize();
}

//////////////////////////////////////////////////

let palette = [
  "#2c695a",
  "#4ad6af",
  "#7facc6",
  "#4e93cc",
  "#f6684f",
  "#ffd300",
];

function setup() {
  C.createCanvas();
  angleMode(DEGREES);
  background("#fffceb");
  fill("gray");
  textFont(font);
  textSize(36);
  text("p5*js", 0, -100);

  // Set up margins
  let margin = 100;
  translate(-canvasSize / 2 + margin, -canvasSize / 2 + margin);

  brush.circle(400, 400, 100);

  randomizeData();
  drawScatterPlot(700, 500, plotData);
}

function getNormalDistData(length) {
  let arr = Array.from(
    { length: length },
    () =>
      (Array.from({ length: 6 }, () => Math.random()).reduce((a, b) => a + b) /
        6) *
      10
  );

  return arr;
}

function draw() {}

let plotData = [];
let pointSizes = [];
let colorValues = [];
let useGroups = false;

function drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight) {
  textAlign(CENTER, CENTER);
  textSize(12);

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

function findMinMaxValues(values) {
  return values.reduce(
    (acc, point) => ({
      minX: Math.min(acc.minX, point.x),
      maxX: Math.max(acc.maxX, point.x),
      minY: Math.min(acc.minY, point.y),
      maxY: Math.max(acc.maxY, point.y),
    }),
    {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    }
  );
}

function drawScatterPlot(chartWidth, chartHeight, values) {
  const padding = 20;
  const plotWidth = chartWidth - 2 * padding;
  const plotHeight = chartHeight - 2 * padding;

  // Find min and max values for x and y
  let { minX, maxX, minY, maxY } = findMinMaxValues(values);

  // Add padding to min and max values
  const xPadding = (maxX - minX) * 0.05;
  const yPadding = (maxY - minY) * 0.05;
  minX -= xPadding;
  maxX += xPadding;
  minY -= yPadding;
  maxY += yPadding;

  // Draw axes
  brush.line(0, plotHeight, plotWidth * 1.05, plotHeight); // x-axis
  brush.line(0, -plotHeight * 0.05, 0, plotHeight); // y-axis

  // Use nice scale
  const {
    min: niceMinY,
    max: niceMaxY,
    tick: niceTickY,
  } = getNiceScale(minY, maxY);

  const {
    min: niceMinX,
    max: niceMaxX,
    tick: niceTickX,
  } = getNiceScale(minX, maxX);

  // Draw x and y scales
  drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight);
  drawYScale(niceMinY, niceMaxY, niceTickY, plotWidth, plotHeight);

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

function getNiceScale(min, max) {
  const range = max - min;
  const magnitude = Math.pow(10, Math.floor(Math.log10(range)));
  const scaledRange = range / magnitude;

  let niceTick;
  if (scaledRange < 1.5) niceTick = 0.1;
  else if (scaledRange < 3) niceTick = 0.2;
  else if (scaledRange < 7) niceTick = 0.5;
  else niceTick = 1;

  niceTick *= magnitude;

  const niceMin = Math.floor(min / niceTick) * niceTick;
  const niceMax = Math.ceil(max / niceTick) * niceTick;

  return { min: niceMin, max: niceMax, tick: niceTick };
}
