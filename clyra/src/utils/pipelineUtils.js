// src/utils/pipelineUtils.js
import Papa from "papaparse";

/**
 * buildPreviewFromCsvText
 * - returns { columns: [], sampleRows: [] } using PapaParse
 */
export function buildPreviewFromCsvText(text, { sampleSize = 500 } = {}) {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const sampleRows = parsed.data.slice(0, sampleSize);
  const columns = parsed.meta.fields ?? (sampleRows[0] ? Object.keys(sampleRows[0]) : []);
  return { columns, sampleRows };
}

export function jsonToCsv(json) {
  return Papa.unparse(json);
}
