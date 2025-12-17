// src/utils/parseFile.js
import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * parseFile(file, { sampleSize })
 * - supports CSV, JSON, Excel
 * - returns: { fileType, columns: [], sampleRows: [], rows: estimatedCount }
 */
export async function parseFile(file, { sampleSize = 10 } = {}) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    return await parseCSV(file, sampleSize);
  } else if (name.endsWith(".json") || file.type === "application/json") {
    return await parseJSON(file, sampleSize);
  } else if (
    name.endsWith(".xls") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xlsb") ||
    name.endsWith(".xlsm")
  ) {
    return await parseExcel(file, sampleSize);
  } else {
    throw new Error("Unsupported file type. Use CSV, JSON or Excel.");
  }
}

function parseCSV(file, sampleSize) {
  return new Promise((resolve, reject) => {
    const sampleRows = [];
    let columns = null;
    let rows = 0;

    Papa.parse(file, {
      header: true,
      worker: true,
      skipEmptyLines: true,
      step: function (result) {
        if (!columns) {
          columns = Object.keys(result.data);
        }
        rows++;
        if (sampleRows.length < sampleSize) sampleRows.push(result.data);
      },
      complete: function (info) {
        resolve({
          fileType: "csv",
          columns: columns || [],
          sampleRows,
          rows,
        });
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}

async function parseJSON(file, sampleSize) {
  const text = await file.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new Error("Invalid JSON file.");
  }

  // accept array of objects or newline-delimited JSON
  let rowsArr = [];
  if (Array.isArray(parsed)) {
    rowsArr = parsed;
  } else {
    // try to split lines, parse each
    const lines = text.trim().split(/\r?\n/);
    for (const line of lines) {
      try {
        rowsArr.push(JSON.parse(line));
      } catch (e) {
        // ignore parse errors for NDJSON
      }
    }
  }

  const columns = rowsArr.length > 0 ? Object.keys(rowsArr[0]) : [];
  return {
    fileType: "json",
    columns,
    sampleRows: rowsArr.slice(0, sampleSize),
    rows: rowsArr.length,
  };
}

async function parseExcel(file, sampleSize) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // convert to JSON (header row used)
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: null });
  const columns = json.length > 0 ? Object.keys(json[0]) : [];
  return {
    fileType: "excel",
    columns,
    sampleRows: json.slice(0, sampleSize),
    rows: json.length,
  };
}
