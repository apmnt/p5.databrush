//////////////////////////////////////////////////
// Object for creation and real-time resize of canvas
// Good function to create canvas and resize functions. I use this in all examples.
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
C.setSize(1500, 2000, 1, "mainCanvas");

function windowResized() {
  C.resize();
}

let palette = [
  "#7b4800",
  "#002185",
  "#003c32",
  "#fcd300",
  "#ff2702",
  "#6b9404",
];

let stroke_brushes = ["2H", "HB"];
let hatch_brushes = ["2H", "HB"];

function setup() {
  C.createCanvas();
  background(255); // Set the background to white
  let brushes = brush.box();
  console.log(brushes);

  brush.fill(random(palette), random(60, 100));
  brush.bleed(random(0.1, 0.4));
  brush.fillTexture(0.55, 0.8);
  // brush.rect(10, 10, 100, 100);

  // let border = -400;
  // let num_rows = 10;
  // let num_cols = 10;
  // let col_size = 100;
  // let row_size = 100;

  // // We create the grid here
  // for (let i = 0; i < num_rows; i++) {
  //   for (let j = 0; j < num_cols; j++) {
  //     brush.set(random(stroke_brushes), random(palette));
  //     brush.setHatch(random(hatch_brushes), random(palette));

  //     brush.fill(random(palette), random(60, 100));
  //     brush.bleed(random(0.1, 0.4));
  //     brush.fillTexture(0.55, 0.8);
  //     // We draw the rectangular grid here
  //     brush.circle(
  //       border / 2 + col_size * j,
  //       border / 2 + row_size * i,
  //       col_size * 0.1,
  //       true
  //     );

  //     // Reset states for next cell
  //     brush.noStroke();
  //     brush.noFill();
  //     brush.noHatch();
  //   }
  // }
}

let frameCounter = 0;
const delayFrames = 2; // Number of frames to wait (e.g., 60 frames for 1 second at 60 FPS)

function draw() {
  if (frameCounter % delayFrames === 0) {
    brush.fill(random(palette), random(60, 100));
    brush.bleed(random(0.05, 0.2));
    brush.fillTexture(0.55, random(0.2, 0.3));
    brush.set(random(stroke_brushes), random(palette));

    let newPoints = [];
    let randomBaseX = random(-500, 500);
    let randomBaseY = random(-500, 500);
    let range = 50;
    for (let i = 0; i < 4; i++) {
      newPoints.push([
        random(randomBaseX + random(-range, range)),
        randomBaseY + random(-range, range),
      ]);
    }

    brush.circle(
      newPoints[0][0],
      newPoints[0][1],
      (newPoints[0][1] * 0.1 + newPoints[0][1] * 0.1) * 0.5,
      true
    );
  }

  frameCounter++;
}
