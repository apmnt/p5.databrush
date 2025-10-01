let fontBold;
let font;
const config = {
  canvasSize: 1000,
  chartWidth: 500,
  chartHeight: 500,
  margin: 100,
  padding: 20,
  plotWidth: 500 - 2 * 20,
  plotHeight: 500 - 2 * 20,
  palette: ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"],
};

function preload() {
  fontBold = loadFont("/Helvetica-bold.ttf");
  font = loadFont("/Helvetica-bold.ttf");
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
  setConfig(newConfig) {
    Object.assign(config, newConfig);
    config.plotWidth = config.chartWidth - 2 * config.padding;
    config.plotHeight = config.chartHeight - 2 * config.padding;
  },
  createCanvas() {
    (this.main = createCanvas(config.canvasSize, config.canvasSize, WEBGL)),
      pixelDensity(this.pD),
      this.main.id(this.css),
      this.resize();
  },
};

C.setSize(config.canvasSize, config.canvasSize, 1, "mainCanvas");

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
  text("*p5.databrush", -200, -10);
  textSize(12);
  translate(
    -config.canvasSize / 2 + config.margin,
    -config.canvasSize / 2 + config.margin
  );
}

function drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight) {
  textAlign(CENTER, CENTER);
  textSize(12);

  brush.line(0, 0, plotWidth, 0); // x-axis bottom
  brush.line(0, plotHeight, plotWidth, plotHeight); // x-axis top

  const numTicksX = Math.round((niceMaxX - niceMinX) / niceTickX);
  for (let i = 1; i < numTicksX; i++) {
    const value = niceMinX + i * niceTickX;
    const x = ((value - niceMinX) / (niceMaxX - niceMinX)) * plotWidth;
    text(value.toFixed(1), x, plotHeight + 10);
    brush.line(x, 0, x, plotHeight);
  }
}

function drawYScale(niceMinY, niceMaxY, niceTickY, plotWidth, plotHeight) {
  textAlign(RIGHT, CENTER);
  textSize(12);

  brush.line(0, 0, 0, plotHeight); // y-axis left
  brush.line(plotWidth, 0, plotWidth, plotHeight); // y-axis right

  const numTicksY = Math.round((niceMaxY - niceMinY) / niceTickY);
  for (let i = 1; i < numTicksY; i++) {
    const value = niceMinY + i * niceTickY;
    const y =
      plotHeight - ((value - niceMinY) / (niceMaxY - niceMinY)) * plotHeight;
    text(value.toFixed(1), -10, y);
    brush.line(0, y, plotWidth, y);
  }
}

function drawGrid(values) {
  // Draw x and y scales
  const { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY } =
    getNiceBounds(values);

  drawXScale(
    niceMinX,
    niceMaxX,
    niceTickX,
    config.plotWidth,
    config.plotHeight
  );
  drawYScale(
    niceMinY,
    niceMaxY,
    niceTickY,
    config.plotWidth,
    config.plotHeight
  );
}

function drawLinePlot(
  yValues,
  xValues = null,
  drawDots = true,
  colors = null,
  plotRange = null,
  fillValues = null
) {
  // Check if yValues is an array of arrays
  const isMultipleLines = Array.isArray(yValues[0]);

  // If xValues is not provided, generate default values
  if (xValues === null) {
    xValues = isMultipleLines
      ? yValues.map((_, i) => range(1, yValues[i].length + 1))
      : range(1, yValues.length + 1);
  }

  // Check if xValues is an array of arrays
  const isMultipleXValues = Array.isArray(xValues[0]);

  // Check for array mismatches
  if (
    isMultipleLines &&
    !isMultipleXValues &&
    xValues.length !== yValues[0].length
  ) {
    throw new Error(
      "Length of xValues does not match the length of each array in yValues."
    );
  }
  if (!isMultipleLines && isMultipleXValues) {
    throw new Error("yValues is not an array of arrays, but xValues is.");
  }
  if (
    isMultipleLines &&
    isMultipleXValues &&
    xValues.length !== yValues.length
  ) {
    throw new Error(
      "Number of arrays in xValues does not match the number of arrays in yValues."
    );
  }

  const { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY } =
    plotRange === null
      ? getNiceBoundsSeparate(
          isMultipleXValues ? xValues.flat() : xValues,
          yValues.flat()
        )
      : getNiceBounds(plotRange);

  // Set random colors if not provided
  const lineColors =
    colors || shuffle(palette).slice(0, isMultipleLines ? yValues.length : 1);

  // Iterate over each array in yValues
  for (let i = 0; i < (isMultipleLines ? yValues.length : 1); i++) {
    const yVals = isMultipleLines ? yValues[i] : yValues;
    const xVals = isMultipleXValues ? xValues[i] : xValues;

    // Draw fill if fillValues is provided
    if (fillValues !== null && fillValues[i] !== undefined) {
      brush.noStroke();
      brush.bleed(0);

      brush.fill(lineColors[i], 100);
      brush.beginShape();
      for (let j = 0; j < xVals.length; j++) {
        const x = map(xVals[j], niceMinX, niceMaxX, 0, config.plotWidth);
        const y1 = map(
          fillValues[i][0][j],
          niceMinY,
          niceMaxY,
          config.plotHeight,
          0
        );
        brush.vertex(x, y1);
      }
      for (let j = xVals.length - 1; j >= 0; j--) {
        const x = map(xVals[j], niceMinX, niceMaxX, 0, config.plotWidth);
        const y2 = map(
          fillValues[i][1][j],
          niceMinY,
          niceMaxY,
          config.plotHeight,
          0
        );
        brush.vertex(x, y2);
      }
      brush.endShape(CLOSE);
    }

    // Plot line
    brush.stroke(lineColors[i]);
    brush.strokeWeight(2);

    for (let j = 0; j < yVals.length - 1; j++) {
      const x1 = map(xVals[j], niceMinX, niceMaxX, 0, config.plotWidth);
      const y1 = map(yVals[j], niceMinY, niceMaxY, config.plotHeight, 0);
      const x2 = map(xVals[j + 1], niceMinX, niceMaxX, 0, config.plotWidth);
      const y2 = map(yVals[j + 1], niceMinY, niceMaxY, config.plotHeight, 0);

      brush.line(x1, y1, x2, y2);
    }

    // Plot dots if drawDots is true
    if (drawDots) {
      brush.fill(lineColors[i], random(60, 100));

      for (let j = 0; j < yVals.length; j++) {
        const x = map(xVals[j], niceMinX, niceMaxX, 0, config.plotWidth);
        const y = map(yVals[j], niceMinY, niceMaxY, config.plotHeight, 0);

        brush.bleed(random(0.01, 0.2));
        brush.fillTexture(0.55, 0.8);
        brush.circle(x, y, random(6, 12));
      }
    }
  }
}

function drawHistogram(values, numBins) {
  // Find min and max values
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Calculate bin width
  const binWidth = config.plotWidth / numBins;
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
  const niceMaxCount = getNiceScaleHist(maxBinCount);
  // const { niceMin, niceMax, niceMaxCount } = getNiceScale(maxBinCount);

  // Draw grid lines
  const numYTicks = 6; // 0 to 5 ticks
  for (let i = 0; i <= numYTicks - 1; i++) {
    const y = config.plotHeight - (config.plotHeight / (numYTicks - 1)) * i;
    brush.line(0, y, config.plotWidth, y); // Horizontal grid line
  }

  // Histogram bars
  brush.fill(random(config.palette), random(60, 100));

  for (let i = 0; i < numBins; i++) {
    brush.bleed(random(0.01, 0.05));
    brush.fillTexture(0.55, 0.8);
    const binHeight = (bins[i] / niceMaxCount) * config.plotHeight;
    brush.rect(
      i * binWidth,
      config.plotHeight - binHeight,
      binWidth - 1,
      binHeight
    );
  }

  // Draw axes
  brush.line(0, config.plotHeight, config.plotWidth, config.plotHeight); // x-axis
  brush.line(0, 0, 0, config.plotHeight); // y-axis

  // Add labels
  textSize(12);

  // X-axis labels
  push(); // Save current transformation matrix
  textAlign(RIGHT, CENTER);

  for (let i = 0; i <= numBins; i++) {
    const value = minValue + i * binSize;
    // Translate to the position where we want to draw the text
    translate(i * binWidth, config.plotHeight + 20); // Moved labels down by increasing y offset
    // Rotate 90 degrees
    rotate(HALF_PI);
    // Draw the text at the rotated position
    text(value.toFixed(1), 0, 0);
    // Reset the transformation
    rotate(-HALF_PI);
    translate(-(i * binWidth), -(config.plotHeight + 20));
  }

  pop(); // Restore transformation matrix

  // Y-axis labels
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= numYTicks - 1; i++) {
    const value = (niceMaxCount / (numYTicks - 1)) * i;
    text(
      Math.round(value),
      -5,
      config.plotHeight - (config.plotHeight / (numYTicks - 1)) * i
    );
  }
}

function drawScatterPlot(values, colors = null, plotRange = null) {
  const { niceMinX, niceMaxX, niceTickX, niceMinY, niceMaxY, niceTickY } =
    plotRange === null
      ? getNiceBounds(values.flat())
      : getNiceBounds(plotRange);

  // Plot points

  if (Array.isArray(values[0])) {
    // Handle array of arrays
    for (let j = 0; j < values.length; j++) {
      const group = values[j];
      const groupColor = Array.isArray(colors)
        ? colors[j % colors.length]
        : colors || random(palette);

      for (let i = 0; i < group.length; i++) {
        const point = group[i];
        // Map data coordinates to screen coordinates
        const x = map(point.x, niceMinX, niceMaxX, 0, plotWidth - 0);
        const y = map(point.y, niceMinY, niceMaxY, plotHeight - 0, 0);

        brush.fill(groupColor, random(60, 100));
        brush.bleed(random(0.01, 0.2));
        brush.fillTexture(0.55, 0.8);
        // brush.noStroke();
        brush.circle(x, y, random(10, 20));
      }
    }
  } else {
    // Handle single array of values
    if (Array.isArray(colors)) {
      throw new Error(
        "Colors should not be an array when values is a single array of points."
      );
    }
    const pointColor = colors || random(palette);

    for (let i = 0; i < values.length; i++) {
      const point = values[i];
      // Map data coordinates to screen coordinates
      const x = map(point.x, niceMinX, niceMaxX, 0, plotWidth - 0);
      const y = map(point.y, niceMinY, niceMaxY, plotHeight - 0, 0);

      brush.fill(pointColor, random(60, 100));
      brush.bleed(random(0.01, 0.2));
      brush.fillTexture(0.55, 0.8);
      // brush.noStroke();
      brush.circle(x, y, random(10, 20));
    }
  }
}

function drawBoxPlot(data) {
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

  // Draw axes
  brush.line(0, plotHeight, plotWidth, plotHeight); // x-axis line
  drawYScale(niceMin, niceMax, niceTick, plotWidth, plotHeight);

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

// Utility functions

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

function getRandomData(length, min, max) {
  let d = [];
  for (let i = 0; i < length; i++) {
    d.push({
      x: random(min, max),
      y: random(min, max),
    });
  }
  return d;
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

function getNiceScaleHist(max) {
  const pow10 = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / pow10;

  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * pow10;
}

function getNiceBoundsSeparate(xValues, yValues) {
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);

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
