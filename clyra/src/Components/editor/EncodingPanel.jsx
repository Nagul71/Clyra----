// src/components/editor/panels/EncodingPanel.jsx
import React, { useState } from "react";

export default function EncodingPanel({ onApply }) {
  const [column, setColumn] = useState("");

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

      {/* Encoding Methods */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-3">
          Encoding Method
        </label>
        <div className="space-y-2">
          <button
            className="w-full px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-all disabled:opacity-50 text-left"
            onClick={() => onApply({ op: "one_hot", column })}
            disabled={!column}
          >
            <div>
              <div className="font-medium">One-Hot Encoding</div>
              <div className="text-xs text-gray-500 mt-0.5">Create binary columns for each category</div>
            </div>
          </button>

          <button
            className="w-full px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-all disabled:opacity-50 text-left"
            onClick={() => onApply({ op: "label_encode", column })}
            disabled={!column}
          >
            <div>
              <div className="font-medium">Label Encoding</div>
              <div className="text-xs text-gray-500 mt-0.5">Convert categories to numeric labels</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}