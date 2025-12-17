// src/components/ProfilingModal.jsx
import React from "react";
import { X, BarChart3, Hash, AlertCircle, TrendingUp } from "lucide-react";

export default function ProfilingModal({ profile, onClose }) {
  if (!profile) return null;

  const { summary, columns } = profile;

  const safeNum = (v, digits = 2) =>
  typeof v === "number" && !isNaN(v) ? v.toFixed(digits) : "–";


  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-6">
      <div className="bg-white max-w-6xl w-full rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Dataset Profile</h2>
              <p className="text-xs text-gray-500">Statistical overview and analysis</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-auto flex-1 p-6">
          {/* Summary Cards */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(summary).map(([key, value]) => (
                <div 
                  key={key} 
                  className="bg-gray-50 rounded-2xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Column Statistics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Column Statistics</h3>
            
            {Object.entries(columns).map(([col, stats]) => (
              <div 
                key={col} 
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-gray-300 transition-colors"
              >
                {/* Column Header */}
                <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base">{col}</h4>
                    <span className="inline-flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700">
                      {stats.dtype}
                    </span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
                    {/* Unique Count */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Hash className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Unique Values</p>
                        <p className="text-base font-semibold">{stats.unique_count}</p>
                      </div>
                    </div>

                    {/* Missing Count */}
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Missing</p>
                        <p className="text-base font-semibold">
                          {stats.missing_count}{" "}
                          <span className="text-sm font-normal text-gray-500">
                            ({stats.missing_percent.toFixed(1)}%)
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Numeric Stats */}
                    {/* Numeric Stats */}
{stats.mean !== undefined && (
  <>
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-500">Mean</p>
        <p className="text-base font-semibold">{safeNum(stats.mean)}</p>
      </div>
    </div>

    <div>
      <p className="text-xs text-gray-500">Median</p>
      <p className="text-base font-semibold">{safeNum(stats.median)}</p>
    </div>

    <div>
      <p className="text-xs text-gray-500">Std Dev</p>
      <p className="text-base font-semibold">{safeNum(stats.std)}</p>
    </div>

    <div>
      <p className="text-xs text-gray-500">Min</p>
      <p className="text-base font-semibold">{safeNum(stats.min)}</p>
    </div>

    <div>
      <p className="text-xs text-gray-500">Max</p>
      <p className="text-base font-semibold">{safeNum(stats.max)}</p>
    </div>
  </>
)}

                  </div>

                  {/* Top Values */}
                  {stats.top_values && stats.top_values.length > 0 && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-3">Most Frequent Values</p>
                      <div className="space-y-2">
                        {stats.top_values.slice(0, 5).map((v, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700 font-medium truncate flex-1 mr-4">
                              {String(v.value)}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                                <div 
                                  className="h-full bg-black rounded-full"
                                  style={{ 
                                    width: `${(v.count / stats.top_values[0].count) * 100}%` 
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 font-medium w-12 text-right">
                                {v.count}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}