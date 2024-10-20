let font;

function preload() {
  font = loadFont("/Helvetica-bold.ttf");
}

function setup() {
  createCanvas(800, 800);
  background(255);

  let points = font.textToPoints("*p5B", 0, 500, 300, {
    sampleFactor: 0.6,
  });

  console.log(points.length);
  console.log(points[0]);
  console.log(points[1]);

  const LENGTH_BETWEEN_POINTS = d(points[0], points[1]);
  console.log(LENGTH_BETWEEN_POINTS);

  // // Translate and scale for better visualization
  // translate(50, 50);
  // scale(20, -20); // Flip the y-axis for a better view
  textSize(10);
  for (let i = 0; i < points.length; i++) {
    text(i, points[i].x, points[i].y);
  }

  drawText(points, LENGTH_BETWEEN_POINTS);
}

function drawText(points, LENGTH_BETWEEN_POINTS) {
  let array_of_shapes = [];
  let curr_shape_array = [];
  let pnn, pn;
  for (let i = 1; i < points.length; i++) {
    pn = points[i - 1];
    pnn = points[i];
    if (d(pn, pnn) - LENGTH_BETWEEN_POINTS < 0.1) {
      curr_shape_array.push(pn);
    } else {
      array_of_shapes.push(curr_shape_array);
      curr_shape_array = [];
    }
  }
  array_of_shapes.push(curr_shape_array);

  let separatedShapes = separateShapesAndHoles(array_of_shapes);
  console.log(separatedShapes);

  // Draw shapes and holes
  for (let [shape, holes] of separatedShapes) {
    fill(200);
    beginShape();
    for (let p of shape) {
      vertex(p.x, p.y);
    }

    for (let hole of holes) {
      beginContour();
      for (let p of hole) {
        vertex(p.x, p.y);
      }
      endContour();
    }
    endShape(CLOSE);
  }
}

function d(p1, p2) {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function makeShape(arr) {
  fill(100);
  beginShape();
  for (p of arr) {
    // brush.vertex(p.x, p.y);
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}

function makeHole(arr) {
  noFill();
  beginContour();
  for (p of arr) {
    // brush.vertex(p.x, p.y);
    vertex(p.x, p.y);
  }
  endContour(CLOSE);
}

function isPointInPolygon(point, polygon) {
  let x = point.x,
    y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x,
      yi = polygon[i].y;
    let xj = polygon[j].x,
      yj = polygon[j].y;

    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isShapeInsideAnother(shape1, shape2) {
  for (let point of shape1) {
    if (!isPointInPolygon(point, shape2)) {
      return false;
    }
  }
  return true;
}

function separateShapesAndHoles(shapes) {
  let result = [];

  for (let i = 0; i < shapes.length; i++) {
    let shape = shapes[i];
    let holes = [];

    for (let j = 0; j < shapes.length; j++) {
      if (i !== j && isShapeInsideAnother(shapes[j], shape)) {
        holes.push(shapes[j]);
      }
    }

    // Check if the shape is already included as a hole in another shape
    let isHole = false;
    for (let k = 0; k < result.length; k++) {
      if (result[k][1].includes(shape)) {
        isHole = true;
        break;
      }
    }

    if (!isHole) {
      result.push([shape, holes]);
    }
  }

  return result;
}
