// src/components/editor/panels/DateExtractPanel.jsx
import React, { useState } from "react";

export default function DateExtractPanel({ onApply }) {
  const [column, setColumn] = useState("");
  const [part, setPart] = useState("year");

  return (
    <div className="space-y-6">
      {/* Column Input */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Column Name
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
          placeholder="Enter column name"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Date Part Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Extract Component
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={part}
          onChange={(e) => setPart(e.target.value)}
        >
          <option value="year">Year</option>
          <option value="month">Month</option>
          <option value="day">Day</option>
        </select>
      </div>

      {/* Apply Button */}
      <button
        className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
        onClick={() =>
          onApply({
            op: "extract_date",
            column,
            part,
          })
        }
        disabled={!column}
      >
        Extract Date Component
      </button>
    </div>
  );
}