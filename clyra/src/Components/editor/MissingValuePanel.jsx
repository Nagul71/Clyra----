// src/components/editor/panels/MissingValuePanel.jsx
import React, { useState } from "react";

export default function MissingValuePanel({ onApply }) {
  const [column, setColumn] = useState("");
  const [strategy, setStrategy] = useState("mean");
  const [customValue, setCustomValue] = useState("");

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

      {/* Strategy Selection */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Imputation Strategy
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        >
          <option value="mean">Mean (average value)</option>
          <option value="median">Median (middle value)</option>
          <option value="mode">Mode (most frequent value)</option>
          <option value="custom">Custom value</option>
        </select>
      </div>

      {/* Custom Value Input */}
      {strategy === "custom" && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Custom Fill Value
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter custom value"
            value={customValue}
            onChange={(e) => setCustomValue(e.target.value)}
          />
        </div>
      )}

      {/* Apply Button */}
      <button
        className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
        onClick={() =>
          onApply({
            op: "impute",
            column,
            strategy,
            value: customValue,
          })
        }
        disabled={!column || (strategy === "custom" && !customValue)}
      >
        Apply Imputation
      </button>
    </div>
  );
}