// src/components/editor/panels/ColumnOperations.jsx
import React, { useState } from "react";

export default function ColumnOperations({ onApply }) {
  const [column, setColumn] = useState("");
  const [newName, setNewName] = useState("");
  const [type, setType] = useState("string");
  const [removeBy, setRemoveBy] = useState("");
  const [replaceFrom, setReplaceFrom] = useState("");
  const [replaceTo, setReplaceTo] = useState("");

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

      {/* Drop & Rename Section */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            onClick={() =>
              onApply({
                op: "drop_column",
                column,
              })
            }
            disabled={!column}
          >
            Drop Column
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Rename Column
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="New name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
              onClick={() =>
                onApply({
                  op: "rename_column",
                  from_col: column,
                  to: newName,
                })
              }
              disabled={!column || !newName}
            >
              Rename
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Change Type Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          Change Data Type
        </label>
        <div className="flex gap-2">
          <select
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="string">String</option>
            <option value="numeric">Numeric</option>
            <option value="boolean">Boolean</option>
            <option value="datetime">DateTime</option>
          </select>
          <button
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            onClick={() =>
              onApply({
                op: "change_type",
                column,
                to_type: type,
              })
            }
            disabled={!column}
          >
            Apply
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Remove Duplicates Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          Remove Duplicates
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Enter column names separated by commas, or leave empty for full row
        </p>
        <div className="flex gap-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="col1, col2"
            value={removeBy}
            onChange={(e) => setRemoveBy(e.target.value)}
          />
          <button
            className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all"
            onClick={() =>
              onApply({
                op: "remove_duplicates",
                columns: removeBy
                  ? removeBy.split(",").map((s) => s.trim())
                  : [],
              })
            }
          >
            Remove
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200"></div>

      {/* Replace Values Section */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-700">
          Replace Values
        </label>
        <div className="space-y-2">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Value to replace"
            value={replaceFrom}
            onChange={(e) => setReplaceFrom(e.target.value)}
          />
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Replace with"
            value={replaceTo}
            onChange={(e) => setReplaceTo(e.target.value)}
          />
          <button
            className="w-full px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            onClick={() =>
              onApply({
                op: "replace_values",
                column,
                from_value: replaceFrom,
                to_value: replaceTo,
              })
            }
            disabled={!column || !replaceFrom}
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
}