// src/utils/inferDtypes.js

/**
 * inferDtypes(sampleRows)
 * - sampleRows: array of objects
 * - returns { columnName: 'numeric'|'integer'|'datetime'|'boolean'|'string' }
 */
export function inferDtypes(sampleRows = []) {
  const dtypes = {};
  if (!sampleRows || sampleRows.length === 0) return dtypes;

  const columns = Object.keys(sampleRows[0]);

  for (const col of columns) {
    const vals = sampleRows.map((r) => r[col]).filter((v) => v !== null && v !== undefined && v !== "");
    let numericCount = 0;
    let intCount = 0;
    let dateCount = 0;
    let boolCount = 0;
    let total = vals.length || 1;

    for (const v of vals) {
      const s = String(v).trim();

      // boolean
      if (/^(true|false|0|1)$/i.test(s)) {
        boolCount++;
      }

      // int / float
      const n = Number(s.replace(/,/g, ""));
      if (!Number.isNaN(n)) {
        numericCount++;
        if (Number.isInteger(n)) intCount++;
      }

      // date-ish detection
      const d = Date.parse(s);
      if (!Number.isNaN(d)) dateCount++;
    }

    // heuristics
    if (numericCount / total > 0.8) {
      if (intCount / numericCount > 0.9) dtypes[col] = "integer";
      else dtypes[col] = "numeric";
    } else if (dateCount / total > 0.6) {
      dtypes[col] = "datetime";
    } else if (boolCount / total > 0.8) {
      dtypes[col] = "boolean";
    } else {
      dtypes[col] = "string";
    }
  }

  return dtypes;
}
