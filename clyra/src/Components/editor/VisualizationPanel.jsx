import React, { useState } from "react";
import {
  BarChart3,
  PieChart,
  Trash2,
  Plus,
  TrendingUp,
  Activity,
  Dot,
  Grid,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Pie,
  PieChart as RePieChart,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626", "#7c3aed"];

/* -----------------------------
   DATA BUILDERS
-------------------------------- */

function buildChartData(rows, config) {
  const { x, y, aggregation } = config;

  // COUNT (categorical)
  if (aggregation === "count") {
    const map = {};
    rows.forEach((r) => {
      const key = r[x] ?? "null";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([k, v]) => ({
      name: k,
      value: v,
    }));
  }

  // HISTOGRAM
  if (aggregation === "histogram") {
    const nums = rows
      .map((r) => Number(r[x]))
      .filter((v) => !isNaN(v));

    const bins = 10;
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const step = (max - min) / bins || 1;

    const buckets = Array.from({ length: bins }, (_, i) => ({
      name: `${(min + i * step).toFixed(1)}–${(min + (i + 1) * step).toFixed(1)}`,
      value: 0,
    }));

    nums.forEach((v) => {
      const idx = Math.min(Math.floor((v - min) / step), bins - 1);
      buckets[idx].value += 1;
    });

    return buckets;
  }

  // SCATTER / LINE
  if (aggregation === "xy") {
    return rows
      .map((r) => ({
        x: Number(r[x]),
        y: Number(r[y]),
      }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));
  }

  return [];
}

/* -----------------------------
   COMPONENT
-------------------------------- */

export default function VisualizationPanel({
  rows,
  visualizations,
  onAdd,
  onDelete,
}) {
  const [newChart, setNewChart] = useState(null);

  const numericColumns =
    rows[0] &&
    Object.keys(rows[0]).filter((c) => !isNaN(Number(rows[0][c])));

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Visualizations</h3>
        <button
          onClick={() =>
            setNewChart({
              chart_type: "bar",
              config: { aggregation: "count" },
            })
          }
          className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-xs"
        >
          <Plus className="w-4 h-4" />
          Add Chart
        </button>
      </div>

      {/* New Chart Creator */}
      {newChart && (
        <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
          <select
            className="w-full border p-2 rounded"
            value={newChart.chart_type}
            onChange={(e) =>
              setNewChart({ ...newChart, chart_type: e.target.value })
            }
          >
            <option value="bar">Bar (Count)</option>
            <option value="pie">Pie</option>
            <option value="histogram">Histogram</option>
            <option value="line">Line</option>
            <option value="scatter">Scatter</option>
          </select>

          {/* X Axis */}
          <select
            className="w-full border p-2 rounded"
            onChange={(e) =>
              setNewChart({
                ...newChart,
                config: {
                  ...newChart.config,
                  x: e.target.value,
                  aggregation:
                    newChart.chart_type === "histogram"
                      ? "histogram"
                      : newChart.chart_type === "scatter" ||
                        newChart.chart_type === "line"
                      ? "xy"
                      : "count",
                },
              })
            }
          >
            <option value="">Select X column</option>
            {rows[0] &&
              Object.keys(rows[0]).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
          </select>

          {/* Y Axis (for scatter / line) */}
          {(newChart.chart_type === "scatter" ||
            newChart.chart_type === "line") && (
            <select
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setNewChart({
                  ...newChart,
                  config: {
                    ...newChart.config,
                    y: e.target.value,
                  },
                })
              }
            >
              <option value="">Select Y column</option>
              {numericColumns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              onAdd({
                chart_type: newChart.chart_type,
                config: newChart.config,
              });
              setNewChart(null);
            }}
            className="w-full bg-blue-600 text-white py-2 rounded text-sm"
          >
            Save Chart
          </button>
        </div>
      )}

      {/* Saved Charts */}
      {visualizations.map((viz) => {
        const data = buildChartData(rows, viz.config);

        return (
          <div key={viz.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium uppercase">
                {viz.chart_type}
              </span>
              <button onClick={() => onDelete(viz.id)}>
                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
              </button>
            </div>

            {/* BAR */}
            {viz.chart_type === "bar" && (
              <BarChart width={260} height={200} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" />
              </BarChart>
            )}

            {/* PIE */}
            {viz.chart_type === "pie" && (
              <RePieChart width={260} height={200}>
                <Pie data={data} dataKey="value" nameKey="name" outerRadius={80}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            )}

            {/* HISTOGRAM */}
            {viz.chart_type === "histogram" && (
              <BarChart width={260} height={200} data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" />
              </BarChart>
            )}

            {/* LINE */}
            {viz.chart_type === "line" && (
              <LineChart width={260} height={200} data={data}>
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="y" stroke="#2563eb" />
              </LineChart>
            )}

            {/* SCATTER */}
            {viz.chart_type === "scatter" && (
              <ScatterChart width={260} height={200}>
                <XAxis dataKey="x" />
                <YAxis dataKey="y" />
                <Tooltip />
                <Scatter data={data} fill="#dc2626" />
              </ScatterChart>
            )}
          </div>
        );
      })}
    </div>
  );
}
