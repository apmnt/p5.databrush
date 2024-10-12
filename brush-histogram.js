function getNiceScale(max) {
  // Round up to a nice number for the scale
  const pow10 = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / pow10;

  let niceFraction;
  if (fraction <= 1) niceFraction = 1;
  else if (fraction <= 2) niceFraction = 2;
  else if (fraction <= 5) niceFraction = 5;
  else niceFraction = 10;

  return niceFraction * pow10;
}

function drawHistogram(values, numBins, chartWidth, chartHeight) {
  // Find min and max values
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Calculate bin width
  const binWidth = chartWidth / numBins;
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
  const niceMaxCount = getNiceScale(maxBinCount);

  // Draw grid lines first (so they appear behind the bars)
  stroke(200); // Light gray color
  strokeWeight(1);
  const numYTicks = 6; // 0 to 5 ticks
  for (let i = 0; i <= numYTicks - 1; i++) {
    const y = chartHeight - (chartHeight / (numYTicks - 1)) * i;
    line(0, y, chartWidth, y); // Horizontal grid line
  }

  // Draw histogram bars
  stroke(0);
  strokeWeight(1);
  fill(75, 150, 255);

  for (let i = 0; i < numBins; i++) {
    const binHeight = (bins[i] / niceMaxCount) * chartHeight;
    rect(i * binWidth, chartHeight - binHeight, binWidth - 1, binHeight);
  }

  // Draw axes
  stroke(0);
  line(0, chartHeight, chartWidth, chartHeight); // x-axis
  line(0, 0, 0, chartHeight); // y-axis

  // Add labels
  textSize(12);

  // X-axis labels
  push(); // Save current transformation matrix
  textAlign(RIGHT, CENTER);

  for (let i = 0; i <= numBins; i++) {
    const value = minValue + i * binSize;
    // Translate to the position where we want to draw the text
    translate(i * binWidth, chartHeight + 20); // Moved labels down by increasing y offset
    // Rotate 90 degrees
    rotate(HALF_PI);
    // Draw the text at the rotated position
    text(value.toFixed(1), 0, 0);
    // Reset the transformation
    rotate(-HALF_PI);
    translate(-(i * binWidth), -(chartHeight + 20));
  }

  pop(); // Restore transformation matrix

  // Y-axis labels
  textAlign(RIGHT, CENTER);
  for (let i = 0; i <= numYTicks - 1; i++) {
    const value = (niceMaxCount / (numYTicks - 1)) * i;
    text(
      Math.round(value),
      -5,
      chartHeight - (chartHeight / (numYTicks - 1)) * i
    );
  }
}

function setup() {
  // Create canvas and put it in the container
  const canvas = createCanvas(600, 470); // Made slightly taller to accommodate lower labels
  canvas.parent("canvas-container");

  // Test data: normally distributed random numbers
  let testData = Array.from(
    { length: 1000 },
    () =>
      (Array.from({ length: 6 }, () => Math.random()).reduce((a, b) => a + b) /
        6) *
      10
  );

  // Set up margins
  const margin = 50;
  translate(margin, margin);

  // Draw histogram with test data
  drawHistogram(testData, 10, width - margin * 2, height - margin * 2);
}
