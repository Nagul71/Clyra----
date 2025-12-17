// src/components/editor/panels/TextCleanPanel.jsx
import React, { useState } from "react";

export default function TextCleanPanel({ onApply }) {
  const [column, setColumn] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [trim, setTrim] = useState(true);
  const [removeSpecial, setRemoveSpecial] = useState(false);
  const [collapseSpaces, setCollapseSpaces] = useState(true);

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

      {/* Options */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-3">
          Cleaning Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Convert to lowercase
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={trim}
              onChange={(e) => setTrim(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Trim whitespace
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={removeSpecial}
              onChange={(e) => setRemoveSpecial(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Remove special characters
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={collapseSpaces}
              onChange={(e) => setCollapseSpaces(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Collapse multiple spaces
            </span>
          </label>
        </div>
      </div>

      {/* Apply Button */}
      <button
        className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
        onClick={() =>
          onApply({
            op: "text_clean",
            column,
            lowercase,
            trim,
            removeSpecial,
            collapseSpaces,
          })
        }
        disabled={!column}
      >
        Apply Text Cleaning
      </button>
    </div>
  );
}
