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
  textSize(12);

  // Set up margins
  let margin = 50;
  translate(-canvasSize / 2 + margin, -canvasSize / 2 + margin);

  brush.circle(0, 0, 100);

  const testDataLength = 1000;
  const testData = [
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
  ];

  drawBoxPlot(450, 700, testData);
}

function getNormalDistData(length, mean, variance) {
  let arr = Array.from({ length: length }, () => {
    let sum = Array.from({ length: 6 }, () => Math.random()).reduce(
      (a, b) => a + b
    );
    let normalValue = (sum / 6) * Math.sqrt(variance) + mean;
    return normalValue;
  });
  return arr;
}

function draw() {}

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

function drawBoxPlot(chartWidth, chartHeight, data) {
  const margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;

  // Find global min and max for scaling
  let allValues = data.flat();
  let minVal = Math.min(...allValues);
  let maxVal = Math.max(...allValues);

  // Use nice scale for the y-axis
  const {
    min: niceMin,
    max: niceMax,
    tick: niceTick,
  } = getNiceScale(minVal, maxVal);
  minVal = niceMin;
  maxVal = niceMax;

  // Drawing settings
  const boxWidth = 50;
  const groupSpacing = plotWidth / (data.length + 1);

  // Move to the plotting area
  push();
  translate(margin.left, margin.top);

  // Draw axes
  brush.line(0, plotHeight, plotWidth, plotHeight); // x-axis
  brush.line(0, 0, 0, plotHeight); // y-axis

  // Draw y-axis labels
  textAlign(RIGHT, CENTER);
  const numTicks = Math.round((maxVal - minVal) / niceTick);
  for (let i = 0; i <= numTicks; i++) {
    const value = minVal + i * niceTick;
    const y = plotHeight - ((value - minVal) / (maxVal - minVal)) * plotHeight;
    text(value.toFixed(1), -10, y);
    brush.line(0, y, plotWidth, y);
  }

  // Draw box plots
  data.forEach((group, index) => {
    const groupX = (index + 1) * groupSpacing;

    // Calculate statistics
    group.sort((a, b) => a - b);
    const q1 = calculateQuantile(group, 0.25);
    const median = calculateQuantile(group, 0.5);
    const q3 = calculateQuantile(group, 0.75);
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    // Find whisker points and outliers
    const outliers = [];
    let lowerWhisker = null;
    let upperWhisker = null;

    group.forEach((value) => {
      if (value < lowerFence || value > upperFence) {
        outliers.push(value);
      } else {
        if (lowerWhisker === null || value < lowerWhisker) lowerWhisker = value;
        if (upperWhisker === null || value > upperWhisker) upperWhisker = value;
      }
    });

    // Scale values to plot height
    const scaleY = (val) => {
      return plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
    };

    // Draw box
    brush.fill(random(palette), random(60, 100));
    brush.bleed(random(0.01, 0.04));
    brush.fillTexture(0.55, 0.8);
    brush.rect(
      groupX - boxWidth / 2,
      scaleY(q3),
      boxWidth,
      scaleY(q1) - scaleY(q3)
    );

    // Draw median line
    brush.line(
      groupX - boxWidth / 2,
      scaleY(median),
      groupX + boxWidth / 2,
      scaleY(median)
    );

    // Draw whiskers
    strokeWeight(1);
    if (upperWhisker !== null) {
      brush.line(groupX, scaleY(q3), groupX, scaleY(upperWhisker)); // Upper whisker
      brush.line(
        groupX - boxWidth / 4,
        scaleY(upperWhisker),
        groupX + boxWidth / 4,
        scaleY(upperWhisker)
      ); // Upper whisker cap
    }
    if (lowerWhisker !== null) {
      brush.line(groupX, scaleY(q1), groupX, scaleY(lowerWhisker)); // Lower whisker
      brush.line(
        groupX - boxWidth / 4,
        scaleY(lowerWhisker),
        groupX + boxWidth / 4,
        scaleY(lowerWhisker)
      ); // Lower whisker cap
    }

    // Draw outliers
    outliers.forEach((value) => {
      brush.circle(groupX, scaleY(value), 5);
    });

    // Draw group labels
    textAlign(CENTER, TOP);
    text(`Group ${index + 1}`, groupX, plotHeight + 10);
  });

  pop();
}

function calculateQuantile(sortedArr, q) {
  const pos = (sortedArr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sortedArr[base + 1] !== undefined) {
    return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
  } else {
    return sortedArr[base];
  }
}
