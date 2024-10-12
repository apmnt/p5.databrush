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

  // Create sample data
  const xValues = Array.from({ length: 10 }, (_, i) => i - 5);
  const yValues = Array.from({ length: 10 }, (_, i) => i - 5);
  const zValues = xValues.map((x) =>
    yValues.map(
      (y) => Math.sin(Math.sqrt(x * x + y * y)) / Math.sqrt(x * x + y * y)
    )
  );
  const levels = [0.15, 0.6];
  //   const levels = [-0.1, 0.2, 0.6, 0.8];

  createContourPlot(500, 500, xValues, yValues, zValues, levels);
}

function draw() {}

// Helper function to interpolate between two points
function interpolate(x1, y1, v1, x2, y2, v2, level) {
  const t = (level - v1) / (v2 - v1);
  return {
    x: x1 + t * (x2 - x1),
    y: y1 + t * (y2 - y1),
  };
}

// Helper function to get nice tick values
function getNiceTickValues(min, max, numTicks) {
  const range = max - min;
  const roughStep = range / numTicks;

  // Get a nice step value (1, 2, or 5 multiplied by a power of 10)
  const step = Math.pow(10, Math.floor(Math.log10(roughStep)));
  let niceStep;
  if (roughStep / step < 2) niceStep = step;
  else if (roughStep / step < 5) niceStep = step * 2;
  else niceStep = step * 5;

  // Get nice min and max values
  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  // Generate tick values
  const ticks = [];
  for (let tick = niceMin; tick <= niceMax; tick += niceStep) {
    ticks.push(tick);
  }
  return ticks;
}

function createContourPlot(width, height, xValues, yValues, zValues, levels) {
  brush.line(0, height, width, height); // x-axis
  brush.line(0, 0, 0, height); // y-axis

  let margin = 0;

  // Helper function to map data coordinates to screen coordinates
  function mapToScreen(x, y) {
    const screenX = map(
      x,
      Math.min(...xValues),
      Math.max(...xValues),
      0,
      width + margin
    );
    const screenY = map(
      y,
      Math.min(...yValues),
      Math.max(...yValues),
      height + margin,
      0
    );
    return { x: screenX, y: screenY };
  }

  // X-axis ticks
  const xTicks = getNiceTickValues(
    Math.min(...xValues),
    Math.max(...xValues),
    4
  );
  xTicks.forEach((x) => {
    const screenX = mapToScreen(x, 0).x;

    // Draw tick
    brush.line(screenX, height, screenX, height + 5);

    // Draw label
    textAlign(CENTER, TOP);
    text(x, screenX, height + 7);
  });

  // Y-axis ticks
  const yTicks = getNiceTickValues(
    Math.min(...yValues),
    Math.max(...yValues),
    4
  );
  yTicks.forEach((y) => {
    const screenY = mapToScreen(0, y).y;

    // Draw tick
    brush.line(margin - 5, screenY, margin, screenY);

    // Draw label
    textAlign(RIGHT, CENTER);
    text(y, margin - 7, screenY);
  });

  // Draw contour lines for each level
  levels.forEach((level, index) => {
    // const hue = map(index, 0, levels.length, 0, 360);
    let contour = [];

    // Iterate through the grid
    for (let i = 0; i < xValues.length - 1; i++) {
      for (let j = 0; j < yValues.length - 1; j++) {
        const x1 = xValues[i];
        const x2 = xValues[i + 1];
        const y1 = yValues[j];
        const y2 = yValues[j + 1];

        const v11 = zValues[i][j];
        const v12 = zValues[i][j + 1];
        const v21 = zValues[i + 1][j];
        const v22 = zValues[i + 1][j + 1];

        // Marching squares algorithm
        let points = [];

        // Check each edge for intersections
        if ((v11 < level && v21 >= level) || (v11 >= level && v21 < level)) {
          const point = interpolate(x1, y1, v11, x2, y1, v21, level);
          points.push(mapToScreen(point.x, point.y));
        }
        if ((v21 < level && v22 >= level) || (v21 >= level && v22 < level)) {
          const point = interpolate(x2, y1, v21, x2, y2, v22, level);
          points.push(mapToScreen(point.x, point.y));
        }
        if ((v12 < level && v22 >= level) || (v12 >= level && v22 < level)) {
          const point = interpolate(x1, y2, v12, x2, y2, v22, level);
          points.push(mapToScreen(point.x, point.y));
        }
        if ((v11 < level && v12 >= level) || (v11 >= level && v12 < level)) {
          const point = interpolate(x1, y1, v11, x1, y2, v12, level);
          points.push(mapToScreen(point.x, point.y));
        }

        // Add points to contours
        if (points.length > 0) {
          contour.push(points);
        }
      }
    }

    brush.fill("#003c32", random(60, 100));
    brush.bleed(0.1);
    brush.fillTexture(0.55, 0.8);
    brush.noStroke();

    let orderedPoints = orderPoints(contour.flat());

    brush.beginShape();
    orderedPoints.forEach((pair) => brush.vertex(pair.x, pair.y));
    brush.endShape(CLOSE);
  });

  // Draw axes labels
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  text("X", width - margin + 20, height - margin);
  text("Y", margin - 20, margin - 20);
}

function orderPoints(points) {
  const orderedPoints = [points[0]];
  const remainingPoints = points.slice(1);

  while (remainingPoints.length > 0) {
    let closestPoint = remainingPoints[0];
    let closestDistance = getDistance(
      orderedPoints[orderedPoints.length - 1],
      closestPoint
    );

    for (let i = 1; i < remainingPoints.length; i++) {
      const distance = getDistance(
        orderedPoints[orderedPoints.length - 1],
        remainingPoints[i]
      );
      if (distance < closestDistance) {
        closestPoint = remainingPoints[i];
        closestDistance = distance;
      }
    }

    orderedPoints.push(closestPoint);
    remainingPoints.splice(remainingPoints.indexOf(closestPoint), 1);
  }

  return orderedPoints;
}

function getDistance(point1, point2) {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}
