// src/components/upload/DatasetPreview.jsx
import React from "react";

export default function DatasetPreview({ meta, dtypes }) {
  if (!meta) return null;
  const { fileType, columns, sampleRows, rows, fileName, sizeBytes } = meta;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Preview</h3>
          <p className="text-sm text-gray-500">Type: {fileType} · Rows: {rows ?? "unknown"} · Size: {formatBytes(sizeBytes)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c} className="px-2 py-1 text-left text-xs text-gray-500">{c} <div className="text-xxs text-gray-400">({dtypes?.[c] ?? "—"})</div></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((r, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => (
                  <td key={c} className="px-2 py-2">{String(r[c] ?? "")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatBytes(bytes = 0) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
