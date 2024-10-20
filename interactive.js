function setup() {
  commonSetup();
  translate(canvasSize / 2 + margin, canvasSize / 2 + margin);
  brush.fill("#f6684f", random(60, 100));
  brush.bleed(random(0.5, 1));
  brush.fillTexture(0.55, 0.8);
}

function draw() {
  if (mouseIsPressed) {
    brush.line(
      mouseX - canvasSize / 2,
      mouseY - canvasSize / 2,
      pmouseX - canvasSize / 2,
      pmouseY - canvasSize / 2,
      20
    ); // Draw a line at the mouse position
  }
}
