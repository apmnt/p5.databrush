function setup() {
  commonSetup();

  const testDataLength = 1000;
  const testData = [
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
    getNormalDistData(testDataLength, random(1, 3), random(2, 5)),
  ];

  drawBoxPlot(testData);
}

function draw() {}
