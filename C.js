let fontBold;
let font;
let initialSize = 1000;
const config = {
  canvasWidth: initialSize,
  canvasHeight: initialSize,
  previousCanvasWidth: initialSize,
  previousCanvasHeight: initialSize,
  padding: 50,
  plotWidth: initialSize - 2 * 50,
  plotHeight: initialSize - 2 * 50,
  previousPlotWidth: initialSize - 2 * 50,
  previousPlotHeight: initialSize - 2 * 50,
  palette: ["#2c695a", "#4ad6af", "#7facc6", "#4e93cc", "#f6684f", "#ffd300"],
  // Style options
  backgroundColor: "#fffceb",
  lineWidth: 1.5,
  lineColor: "#000000ff",
  fontSize: 20,
  titleFontSize: 36,
  axisLabelColor: "#4b4b4bff",
  bleedMin: 0.01,
  bleedMax: 0.03,
  brushType: "charcoal",
  gridBrushType: "pen",
  gridLineColor: "#000000ff",
  gridLineWidth: 1,
};

// Check for pending config from page reload
if (sessionStorage.getItem("pendingCanvasConfig")) {
  try {
    const pendingConfig = JSON.parse(
      sessionStorage.getItem("pendingCanvasConfig")
    );
    Object.assign(config, pendingConfig);
    config.plotWidth = config.canvasWidth - 2 * config.padding;
    config.plotHeight = config.canvasHeight - 2 * config.padding;
    sessionStorage.removeItem("pendingCanvasConfig");
  } catch (e) {
    console.error("Failed to load pending config:", e);
  }
}

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
  setSize(w, h, p, css) {
    (this.width = w), (this.height = h), (this.pD = p), (this.css = css);
  },
  setConfig(newConfig) {
    let dimensionsChanged =
      newConfig.canvasWidth !== config.canvasWidth ||
      newConfig.canvasHeight !== config.canvasHeight;
    Object.assign(config, newConfig);
    config.plotWidth = config.canvasWidth - 2 * config.padding;
    config.plotHeight = config.canvasHeight - 2 * config.padding;
    if (dimensionsChanged) {
      reloadWithNewDimensions(config.canvasWidth, config.canvasHeight);
    }
  },
  createCanvas() {
    try {
      // In global mode, p5.js functions are available globally after setup runs
      // Check if createCanvas is available
      if (typeof createCanvas !== "function") {
        console.error("p5.js is not loaded or createCanvas is not available");
        return;
      }

      this.main = createCanvas(config.canvasWidth, config.canvasHeight, WEBGL);
      pixelDensity(this.pD);
      this.main.id(this.css);
      this.main.parent("chartContainer");
      console.log("WebGL canvas created successfully");
    } catch (e) {
      console.error("Failed to create WebGL canvas:", e);
      throw e;
    }
  },
};

C.setSize(config.canvasWidth, config.canvasHeight, 1, "mainCanvas");

function windowResized() {}

function reloadWithNewDimensions(newWidth, newHeight) {
  sessionStorage.setItem(
    "pendingCanvasConfig",
    JSON.stringify({
      canvasWidth: newWidth,
      canvasHeight: newHeight,
      padding: config.padding,
    })
  );
  location.reload();
}

function commonSetup() {
  C.createCanvas();
  // setup the rest
  setupRest();
}

function setupRest() {
  brush.pick(config.brushType);
  angleMode(DEGREES);
  background(config.backgroundColor);
  fill(config.axisLabelColor);
  textFont(font);
  textSize(config.titleFontSize);
  text("*p5.databrush", -200, -10);
  textSize(config.fontSize);
  translate(-config.plotWidth / 2, -config.plotHeight / 2);
}

function drawXScale(niceMinX, niceMaxX, niceTickX, plotWidth, plotHeight) {
  brush.pick(config.gridBrushType);
  textAlign(CENTER, CENTER);
  textSize(config.fontSize);
  fill(config.axisLabelColor);

  brush.stroke(config.gridLineColor);
  brush.strokeWeight(config.gridLineWidth);
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
  brush.pick(config.gridBrushType);
  textAlign(RIGHT, CENTER);
  textSize(config.fontSize);
  fill(config.axisLabelColor);

  brush.stroke(config.gridLineColor);
  brush.strokeWeight(config.gridLineWidth);
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
  brush.pick(config.brushType);
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
    colors ||
    shuffle(config.palette).slice(0, isMultipleLines ? yValues.length : 1);

  // Iterate over each array in yValues
  for (let i = 0; i < (isMultipleLines ? yValues.length : 1); i++) {
    const yVals = isMultipleLines ? yValues[i] : yValues;
    const xVals = isMultipleXValues ? xValues[i] : xValues;

    // Draw fill if fillValues is provided
    if (fillValues !== null && fillValues[i] !== undefined) {
      brush.noStroke();
      brush.bleed(config.bleedMin);

      brush.fill(lineColors[i]);
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
    brush.strokeWeight(10);

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

        brush.bleed(random(config.bleedMin, config.bleedMax));
        brush.fillTexture(0.55, 0.8);
        brush.circle(x, y, random(6, 12));
      }
    }
  }
}

function drawHistogram(values, numBins) {
  brush.pick(config.brushType);
  // debugger;
  let cw = config.canvasWidth;
  let ch = config.canvasHeight;
  let pw = config.plotWidth;
  let ph = config.plotHeight;
  let padding = config.padding;
  let palette = config.palette;
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
  brush.pick(config.gridBrushType);
  brush.stroke(config.gridLineColor);
  brush.strokeWeight(config.gridLineWidth);
  for (let i = 0; i <= numYTicks - 1; i++) {
    const y = config.plotHeight - (config.plotHeight / (numYTicks - 1)) * i;
    brush.line(0, y, config.plotWidth, y); // Horizontal grid line
  }

  // Histogram bars
  brush.pick(config.brushType);
  brush.fill(random(config.palette), random(60, 100));

  for (let i = 0; i < numBins; i++) {
    brush.bleed(random(config.bleedMin, config.bleedMax));
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
  brush.pick(config.gridBrushType);
  brush.stroke(config.lineColor);
  brush.strokeWeight(config.lineWidth);
  brush.line(0, config.plotHeight, config.plotWidth, config.plotHeight); // x-axis
  brush.line(0, 0, 0, config.plotHeight); // y-axis

  // Add labels
  textSize(config.fontSize);
  fill(config.axisLabelColor);

  // X-axis labels
  let yOffset = config.fontSize + 5;
  push(); // Save current transformation matrix
  textAlign(CENTER);

  for (let i = 0; i <= numBins; i++) {
    const value = minValue + i * binSize;
    // Translate to the position where we want to draw the text
    translate(i * binWidth, config.plotHeight + yOffset); // Moved labels down by increasing y offset
    // Rotate 90 degrees
    // rotate(HALF_PI);
    // Draw the text at the rotated position
    text(value.toFixed(1), 0, 0);
    // Reset the transformation
    // rotate(-HALF_PI);
    translate(-(i * binWidth), -(config.plotHeight + yOffset));
  }

  pop(); // Restore transformation matrix

  // Y-axis labels
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= numYTicks - 1; i++) {
    if (i === 0) continue; // Skip the zero label
    const value = (niceMaxCount / (numYTicks - 1)) * i;
    text(
      Math.round(value),
      -5,
      config.plotHeight - (config.plotHeight / (numYTicks - 1)) * i
    );
  }
}

function drawScatterPlot(values, colors = null, plotRange = null) {
  brush.pick(config.brushType);
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
        : colors || random(config.palette);

      for (let i = 0; i < group.length; i++) {
        const point = group[i];
        // Map data coordinates to screen coordinates
        const x = map(point.x, niceMinX, niceMaxX, 0, config.plotWidth - 0);
        const y = map(point.y, niceMinY, niceMaxY, config.plotHeight - 0, 0);

        brush.fill(groupColor, random(60, 100));
        brush.bleed(random(config.bleedMin, config.bleedMax));
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
    const pointColor = colors || random(config.palette);

    for (let i = 0; i < values.length; i++) {
      const point = values[i];
      // Map data coordinates to screen coordinates
      const x = map(point.x, niceMinX, niceMaxX, 0, config.plotWidth - 0);
      const y = map(point.y, niceMinY, niceMaxY, config.plotHeight - 0, 0);

      brush.fill(pointColor, random(60, 100));
      brush.bleed(random(config.bleedMin, config.bleedMax));
      brush.fillTexture(0.55, 0.8);
      // brush.noStroke();
      brush.circle(x, y, random(10, 20));
    }
  }
}

function drawBoxPlot(data) {
  brush.pick(config.brushType);
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
  const groupSpacing = config.plotWidth / (data.length + 1);

  // Move to the plotting area
  push();

  // Draw axes
  brush.pick(config.gridBrushType);
  brush.stroke(config.gridLineColor);
  brush.strokeWeight(config.gridLineWidth);
  brush.line(0, config.plotHeight, config.plotWidth, config.plotHeight); // x-axis line
  drawYScale(niceMin, niceMax, niceTick, config.plotWidth, config.plotHeight);

  // Draw box plots
  brush.pick(config.brushType);
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
      return (
        config.plotHeight -
        ((val - minVal) / (maxVal - minVal)) * config.plotHeight
      );
    };

    // Draw box
    brush.fill(random(config.palette), random(60, 100));
    brush.bleed(random(config.bleedMin, config.bleedMax));
    brush.fillTexture(0.55, 0.8);
    brush.rect(
      groupX - boxWidth / 2,
      scaleY(q3),
      boxWidth,
      scaleY(q1) - scaleY(q3)
    );

    // Draw median line
    brush.pick(config.gridBrushType);
    brush.stroke(config.gridLineColor);
    brush.strokeWeight(config.gridLineWidth);
    brush.line(
      groupX - boxWidth / 2,
      scaleY(median),
      groupX + boxWidth / 2,
      scaleY(median)
    );

    // Draw whiskers
    strokeWeight(config.gridLineWidth);
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
    textSize(config.fontSize);
    fill(config.axisLabelColor);
    text(`Group ${index + 1}`, groupX, config.plotHeight + 10);
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

function range(start, end) {
  return Array.from({ length: end - start }, (_, i) => start + i);
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
