let font;
const canvasSize = 1000;
const chartWidth = 600;
const chartHeight = 500;
const margin = 100;

const padding = 20;
const plotWidth = chartWidth - 2 * padding;
const plotHeight = chartHeight - 2 * padding;

const palette = [
  "#2c695a",
  "#4ad6af",
  "#7facc6",
  "#4e93cc",
  "#f6684f",
  "#ffd300",
];

function preload() {
  font = loadFont("/Inter.ttf");
}

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

function commonSetup() {
  C.createCanvas();
  angleMode(DEGREES);
  background("#fffceb");
  fill("gray");
  textFont(font);
  textSize(36);
  text("p5*js", 0, -100);

  // Set up margins
  translate(-canvasSize / 2 + margin, -canvasSize / 2 + margin);

  brush.circle(400, 400, 100);
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

// Utility functions
function getNormalDistData(length) {
  return Array.from(
    { length },
    () =>
      (Array.from({ length: 6 }, () => Math.random()).reduce((a, b) => a + b) /
        6) *
      10
  );
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

function getNiceBounds(values) {
  const { minX, maxX, minY, maxY } = findMinMaxValues(values);

  const xPadding = (maxX - minX) * 0.05;
  const yPadding = (maxY - minY) * 0.05;

  const paddedMinX = minX - xPadding;
  const paddedMaxX = maxX + xPadding;
  const paddedMinY = minY - yPadding;
  const paddedMaxY = maxY + yPadding;

  const {
    min: niceMinX,
    max: niceMaxX,
    tick: niceTickX,
  } = getNiceScale(paddedMinX, paddedMaxX);
  const {
    min: niceMinY,
    max: niceMaxY,
    tick: niceTickY,
  } = getNiceScale(paddedMinY, paddedMaxY);

  return { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY };
}
