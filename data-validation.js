(function (root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.p5DataValidation = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function isPoint(value) {
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      isFiniteNumber(value.x) &&
      isFiniteNumber(value.y)
    );
  }

  function isNumberArray(value) {
    return Array.isArray(value) && value.length > 0 && value.every(isFiniteNumber);
  }

  function isScatterSeries(value) {
    return Array.isArray(value) && value.length > 0 && value.every(isPoint);
  }

  function isBarDatum(value) {
    return (
      !!value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      isFiniteNumber(value.value) &&
      (value.label === undefined || typeof value.label === "string")
    );
  }

  function parseChartDataInput(dataInput) {
    try {
      return {
        ok: true,
        parsed: JSON.parse(dataInput),
      };
    } catch (error) {
      return {
        ok: false,
        error: "Data must be valid JSON.",
      };
    }
  }

  function validateParsedChartData(chartType, parsed) {
    switch (chartType) {
      case "histogram":
        if (isNumberArray(parsed)) {
          return { ok: true, parsed };
        }
        return {
          ok: false,
          error: "Histogram data must be a non-empty JSON array of numbers.",
        };

      case "scatter":
        if (
          isScatterSeries(parsed) ||
          (Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every(isScatterSeries))
        ) {
          return { ok: true, parsed };
        }
        return {
          ok: false,
          error:
            "Scatter data must be a non-empty array of { x, y } points or an array of non-empty point arrays.",
        };

      case "boxplot":
        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(isNumberArray)
        ) {
          return { ok: true, parsed };
        }
        return {
          ok: false,
          error:
            "Box plot data must be a non-empty array of non-empty number arrays.",
        };

      case "line":
        if (
          isNumberArray(parsed) ||
          (Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every(isNumberArray))
        ) {
          return { ok: true, parsed };
        }
        return {
          ok: false,
          error:
            "Line data must be a non-empty array of numbers or a non-empty array of non-empty number arrays.",
        };

      case "barplot":
        if (
          isNumberArray(parsed) ||
          (Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every(isBarDatum))
        ) {
          return { ok: true, parsed };
        }
        return {
          ok: false,
          error:
            "Bar plot data must be a non-empty array of numbers or an array of { label, value } objects.",
        };

      default:
        return {
          ok: false,
          error: `Unsupported chart type: ${chartType}.`,
        };
    }
  }

  function validateChartData(chartType, dataInput) {
    const parsedResult = parseChartDataInput(dataInput);
    if (!parsedResult.ok) {
      return parsedResult;
    }

    return validateParsedChartData(chartType, parsedResult.parsed);
  }

  return {
    parseChartDataInput,
    validateParsedChartData,
    validateChartData,
  };
});
