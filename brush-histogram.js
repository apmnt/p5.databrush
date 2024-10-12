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

function getNiceScale(max) {
  // Round up to a nice number for the scale
  const pow10 = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / pow10;

  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * pow10;
}

function drawHistogram(values, numBins, chartWidth, chartHeight) {
  // Find min and max values
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Calculate bin width
  const binWidth = chartWidth / numBins;
  const valueRange = maxValue - minValue;
  const binSize = valueRange / numBins;

  // Create bins
  const bins = new Array(numBins).fill(0);

  // Fill bins
  values.forEach((value) => {
    const binIndex = Math.min(
      Math.floor((value - minValue) / binSize),
      numBins - 1
    );
    bins[binIndex]++;
  });

  // Find max bin count for scaling and round up to nice number
  const maxBinCount = Math.max(...bins);
  const niceMaxCount = getNiceScale(maxBinCount);

  // Draw grid lines
  const numYTicks = 6; // 0 to 5 ticks
  for (let i = 0; i <= numYTicks - 1; i++) {
    const y = chartHeight - (chartHeight / (numYTicks - 1)) * i;
    brush.line(0, y, chartWidth, y); // Horizontal grid line
  }

  // Histogram bars
  brush.fill(random(palette), random(60, 100));

  for (let i = 0; i < numBins; i++) {
    brush.bleed(random(0.01, 0.05));
    brush.fillTexture(0.55, 0.8);
    const binHeight = (bins[i] / niceMaxCount) * chartHeight;
    brush.rect(i * binWidth, chartHeight - binHeight, binWidth - 1, binHeight);
  }

  // Draw axes
  brush.line(0, chartHeight, chartWidth, chartHeight); // x-axis
  brush.line(0, 0, 0, chartHeight); // y-axis

  // Add labels
  textSize(12);

  // X-axis labels
  push(); // Save current transformation matrix
  textAlign(RIGHT, CENTER);

  for (let i = 0; i <= numBins; i++) {
    const value = minValue + i * binSize;
    // Translate to the position where we want to draw the text
    translate(i * binWidth, chartHeight + 20); // Moved labels down by increasing y offset
    // Rotate 90 degrees
    rotate(HALF_PI);
    // Draw the text at the rotated position
    text(value.toFixed(1), 0, 0);
    // Reset the transformation
    rotate(-HALF_PI);
    translate(-(i * binWidth), -(chartHeight + 20));
  }

  pop(); // Restore transformation matrix

  // Y-axis labels
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= numYTicks - 1; i++) {
    const value = (niceMaxCount / (numYTicks - 1)) * i;
    text(
      Math.round(value),
      -5,
      chartHeight - (chartHeight / (numYTicks - 1)) * i
    );
  }
}

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

  // Test data: normally distributed random numbers
  let testData = getNormalDistData(1000);

  // Set up margins
  let margin = 50;
  translate(-canvasSize / 2 + 50, -canvasSize / 2 + 50);

  brush.circle(0, 0, 100);
  // Draw histogram with test data
  drawHistogram(testData, 10, 500, 500);
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
