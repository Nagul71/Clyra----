// src/components/editor/panels/ScalingPanel.jsx
import React, { useState } from "react";

export default function ScalingPanel({ onApply }) {
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

      {/* Scaling Methods */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-3">
          Scaling Method
        </label>
        <div className="space-y-2">
          <button
            className="w-full px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-all disabled:opacity-50 text-left"
            onClick={() => onApply({ op: "scale_minmax", column })}
            disabled={!column}
          >
            <div>
              <div className="font-medium">Min-Max Scaling</div>
              <div className="text-xs text-gray-500 mt-0.5">Scale values to range [0, 1]</div>
            </div>
          </button>

          <button
            className="w-full px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-all disabled:opacity-50 text-left"
            onClick={() => onApply({ op: "scale_standard", column })}
            disabled={!column}
          >
            <div>
              <div className="font-medium">Standard Scaling</div>
              <div className="text-xs text-gray-500 mt-0.5">Standardize using mean and std deviation</div>
            </div>
          </button>

          <button
            className="w-full px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium rounded-lg transition-all disabled:opacity-50 text-left"
            onClick={() => onApply({ op: "scale_robust", column })}
            disabled={!column}
          >
            <div>
              <div className="font-medium">Robust Scaling</div>
              <div className="text-xs text-gray-500 mt-0.5">Scale using median and IQR</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}