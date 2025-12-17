import React from "react";
import { X } from "lucide-react";

export default function PreviewModal({ preview, onClose, onApply }) {
  if (!preview) return null;

  function PreviewTable({ rows }) {
    if (!rows || rows.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 bg-white rounded-lg border border-gray-200">
          <p className="text-xs text-gray-400">No data available</p>
        </div>
      );
    }

    const columns = Object.keys(rows[0]);

    return (
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <div className="overflow-x-auto overflow-y-auto max-h-80 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th 
                    key={col} 
                    className="px-4 py-2.5 text-xs font-medium text-gray-600 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {rows.slice(0, 20).map((row, i) => (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  {columns.map((col) => (
                    <td 
                      key={col} 
                      className="px-4 py-2.5 text-xs text-gray-700 whitespace-nowrap"
                    >
                      {String(row[col] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
      <div className="max-w-6xl w-full max-h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Data Preview</h3>
          <button 
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto flex-1 scrollbar-hide">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="grid grid-cols-2 gap-6">
            {/* Before */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <h4 className="text-xs font-medium text-gray-900">Before</h4>
              </div>
              <PreviewTable rows={preview.before} />
            </div>

            {/* After */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full"></div>
                <h4 className="text-xs font-medium text-gray-900">After</h4>
              </div>
              <PreviewTable rows={preview.after} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex justify-end">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}