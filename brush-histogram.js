function setup() {
  commonSetup();
  // Test data: normally distributed random numbers
  let testData = getNormalDistData(1000, 100, 40);
  console.log(testData);
  // Draw histogram with test data
  drawHistogram(testData, 10);
}

function draw() {}
