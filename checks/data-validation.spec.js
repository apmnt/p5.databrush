const test = require("node:test");
const assert = require("node:assert/strict");

const {
  parseChartDataInput,
  validateParsedChartData,
  validateChartData,
} = require("../data-validation.js");

test("parseChartDataInput rejects malformed JSON", () => {
  const result = parseChartDataInput("[1, 2,");
  assert.equal(result.ok, false);
  assert.equal(result.error, "Data must be valid JSON.");
});

test("validateChartData accepts histogram arrays of numbers", () => {
  const result = validateChartData("histogram", "[1, 2, 3]");
  assert.equal(result.ok, true);
  assert.deepEqual(result.parsed, [1, 2, 3]);
});

test("validateChartData rejects empty histogram arrays", () => {
  const result = validateChartData("histogram", "[]");
  assert.equal(result.ok, false);
  assert.match(result.error, /Histogram data/);
});

test("validateChartData accepts scatter point arrays", () => {
  const result = validateChartData(
    "scatter",
    '[{"x": 1, "y": 2}, {"x": 3, "y": 4}]'
  );
  assert.equal(result.ok, true);
});

test("validateChartData accepts nested scatter series", () => {
  const result = validateChartData(
    "scatter",
    '[[{"x": 1, "y": 2}], [{"x": 3, "y": 4}]]'
  );
  assert.equal(result.ok, true);
});

test("validateChartData rejects scatter data without numeric x/y points", () => {
  const result = validateChartData("scatter", '[{"x": 1, "z": 2}]');
  assert.equal(result.ok, false);
  assert.match(result.error, /Scatter data/);
});

test("validateChartData accepts non-empty box plot groups", () => {
  const result = validateChartData("boxplot", "[[1, 2, 3], [4, 5, 6]]");
  assert.equal(result.ok, true);
});

test("validateChartData rejects empty box plot groups", () => {
  const result = validateChartData("boxplot", "[[1, 2], []]");
  assert.equal(result.ok, false);
  assert.match(result.error, /Box plot data/);
});

test("validateChartData accepts flat and nested line data", () => {
  assert.equal(validateChartData("line", "[1, 2, 3]").ok, true);
  assert.equal(validateChartData("line", "[[1, 2, 3], [4, 5, 6]]").ok, true);
});

test("validateChartData rejects non-numeric line data", () => {
  const result = validateChartData("line", '[{"x": 1, "y": 2}]');
  assert.equal(result.ok, false);
  assert.match(result.error, /Line data/);
});

test("validateChartData accepts numeric and labeled bar data", () => {
  assert.equal(validateChartData("barplot", "[10, 20, 30]").ok, true);
  assert.equal(
    validateChartData(
      "barplot",
      '[{"label": "A", "value": 10}, {"label": "B", "value": 20}]'
    ).ok,
    true
  );
});

test("validateChartData rejects malformed bar data", () => {
  const result = validateChartData(
    "barplot",
    '[{"label": 10, "value": "20"}]'
  );
  assert.equal(result.ok, false);
  assert.match(result.error, /Bar plot data/);
});

test("validateParsedChartData rejects unsupported chart types", () => {
  const result = validateParsedChartData("pie", [1, 2, 3]);
  assert.equal(result.ok, false);
  assert.equal(result.error, "Unsupported chart type: pie.");
});
