function setup() {
  commonSetup();
  runDemos();
}

function runDemos() {
  const delay = 1000; // 2 seconds in milliseconds
  let totalDelay = 0;

  // Function to run a demo multiple times
  function runDemoMultipleTimes(demoFunction) {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        lightSetup();
        demoFunction();
      }, totalDelay);
      totalDelay += delay;
    }
  }

  // Run demoHist 5 times
  runDemoMultipleTimes(demoHist);

  // Run demoBox 5 times

  runDemoMultipleTimes(demoBox);

  // Run demoScatter 5 times

  runDemoMultipleTimes(demoScatter);
}

function draw() {
  // No need to do anything in draw
}

function lightSetup() {
  angleMode(DEGREES);
  background("#fffceb");
  translate(-canvasSize / 2 + margin, -canvasSize / 2 + margin);
  textSize(36);
  textFont(fontBold);
  text("*p5.databrush", 350, -60);
  textFont(font);
  textSize(12);
}

function demoHist() {
  // Test data: normally distributed random numbers
  let testData = getNormalDistData(1000, 100, 40);
  console.log(testData);
  // Draw histogram with test data
  drawHistogram(testData, 10);
}

function demoBox() {
  const testDataLength = 1000;
  const testData = [
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
  ];

  drawBoxPlot(testData);
}

function demoScatter() {
  let plotData = getRandomData(50, 0, 10);
  drawGrid(plotData);
  drawScatterPlot(plotData);
}
