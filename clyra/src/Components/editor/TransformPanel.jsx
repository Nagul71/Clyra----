import React from "react";
import { 
  Columns, 
  Droplets, 
  Binary, 
  Ruler, 
  FileText, 
  Calendar 
} from "lucide-react";

import ColumnOperations from "./ColumnOperations";
import MissingValuePanel from "./MissingValuePanel";
import EncodingPanel from "./EncodingPanel";
import ScalingPanel from "./ScalingPanel";
import TextCleanPanel from "./TextCleanPanel";
import DateExtractPanel from "./DateExtractPanel";


// --------------------------------------------------
// APPLY STEP LOCAL (FULL FIXED VERSION)
// --------------------------------------------------
function applyStepLocal(rows, cols, step) {
  let newRows = JSON.parse(JSON.stringify(rows || []));
  let newCols = JSON.parse(JSON.stringify(cols || []));

  const op = step.op;

  // DROP COLUMN
  if (op === "drop_column") {
    const col = step.column;
    newCols = newCols.filter(c => c.field !== col);
    newRows = newRows.map(r => {
      const copy = { ...r };
      delete copy[col];
      return copy;
    });
  }

  // RENAME COLUMN
  else if (op === "rename_column") {
    const from =
      step.from_col ||
      step.from ||
      step.from_ ||
      step.column ||
      step.from_value;

    const to = step.to || step.to_value;

    if (!from || !to) return { newRows, newCols };

    newCols = newCols.map(c =>
      c.field === from ? { ...c, field: to, headerName: to } : c
    );

    newRows = newRows.map(r => {
      const copy = { ...r };
      if (from in copy) {
        copy[to] = copy[from];
        delete copy[from];
      }
      return copy;
    });
  }

  // CHANGE TYPE
  else if (op === "change_type") {
    const { column, to_type } = step;
    newRows = newRows.map(r => {
      const val = r[column];
      let out = val;

      if (to_type === "numeric") {
        const num = Number(String(val).replace(/,/g, ""));
        out = Number.isNaN(num) ? null : num;
      } else if (to_type === "string") out = val == null ? "" : String(val);
      else if (to_type === "boolean")
        out = ["1", "true", "yes"].includes(String(val).toLowerCase());
      else if (to_type === "datetime") {
        const d = new Date(val);
        out = isNaN(d.getTime()) ? null : d.toISOString();
      }

      r[column] = out;
      return r;
    });
  }

  // REMOVE DUPLICATES
  else if (op === "remove_duplicates") {
    const byColumns =
      step.columns || step.byColumns || step.by || step.by_cols || [];

    const seen = new Set();
    newRows = newRows.filter(r => {
      const key =
        byColumns.length > 0
          ? byColumns.map(c => JSON.stringify(r[c] ?? "")).join("|")
          : JSON.stringify(r);

      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // REPLACE VALUES
  else if (op === "replace_values") {
    const col = step.column;
    const from = step.from_value || step.from;
    const to = step.to_value || step.to;

    newRows = newRows.map(r => {
      if (String(r[col]) === String(from)) r[col] = to;
      return r;
    });
  }

  // IMPUTE
  else if (op === "impute") {
    const { column, strategy, value } = step;

    const vals = newRows
      .map(r => r[column])
      .filter(v => v !== null && v !== undefined && v !== "");

    const nums = vals
      .map(v => Number(String(v).replace(/,/g, "")))
      .filter(n => !Number.isNaN(n));

    let fill = value;

    if (strategy === "mean" && nums.length)
      fill = nums.reduce((a, b) => a + b, 0) / nums.length;

    else if (strategy === "median" && nums.length) {
      const sorted = nums.slice().sort((a, b) => a - b);
      fill = sorted[Math.floor(sorted.length / 2)];
    }

    else if (strategy === "mode" && vals.length) {
      const counts = {};
      vals.forEach(v => (counts[v] = (counts[v] || 0) + 1));
      fill = Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
      );
    }

    newRows = newRows.map(r => {
      if (r[column] === null || r[column] === undefined || r[column] === "")
        r[column] = fill;
      return r;
    });
  }

  // ONE HOT
  else if (op === "one_hot") {
    const col = step.column;
    const categories = [...new Set(newRows.map(r => r[col] ?? "null"))];

    categories.forEach(cat => {
      const fname = `${col}__${String(cat).replace(/\s+/g, "_")}`;
      newCols.push({ headerName: fname, field: fname, editable: false });

      newRows = newRows.map(r => ({
        ...r,
        [fname]: r[col] == cat ? 1 : 0,
      }));
    });
  }

  // LABEL ENCODE
  else if (op === "label_encode") {
    const col = step.column;
    const cats = [...new Set(newRows.map(r => r[col] ?? "null"))];
    const map = Object.fromEntries(cats.map((c, i) => [c, i]));
    const outCol = `${col}_label`;

    newCols.push({ headerName: outCol, field: outCol, editable: false });

    newRows = newRows.map(r => ({
      ...r,
      [outCol]: map[r[col] ?? "null"],
    }));
  }

  // SCALING
  else if (
    op === "scale_minmax" ||
    op === "scale_standard" ||
    op === "scale_robust"
  ) {
    const col = step.column;
    const nums = newRows
      .map(r => Number(r[col]))
      .filter(n => !Number.isNaN(n));

    if (!nums.length) return { newRows, newCols };

    if (op === "scale_minmax") {
      const min = Math.min(...nums),
        max = Math.max(...nums);
      const outCol = `${col}_minmax`;

      newCols.push({ headerName: outCol, field: outCol, editable: false });

      newRows = newRows.map(r => ({
        ...r,
        [outCol]: Number.isNaN(Number(r[col]))
          ? null
          : (Number(r[col]) - min) / (max - min),
      }));
    }

    if (op === "scale_standard") {
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const std = Math.sqrt(
        nums.map(n => (n - mean) ** 2).reduce((a, b) => a + b, 0) /
          nums.length
      );
      const outCol = `${col}_std`;

      newCols.push({ headerName: outCol, field: outCol, editable: false });

      newRows = newRows.map(r => ({
        ...r,
        [outCol]: Number.isNaN(Number(r[col]))
          ? null
          : (Number(r[col]) - mean) / (std || 1),
      }));
    }

    if (op === "scale_robust") {
      const sorted = nums.slice().sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1 || 1;
      const outCol = `${col}_robust`;

      newCols.push({ headerName: outCol, field: outCol, editable: false });

      newRows = newRows.map(r => ({
        ...r,
        [outCol]: Number.isNaN(Number(r[col]))
          ? null
          : (Number(r[col]) - (q1 + q3) / 2) / iqr,
      }));
    }
  }

  // TEXT CLEAN
  else if (op === "text_clean") {
    const { column, lowercase, trim, removeSpecial, collapseSpaces } = step;

    newRows = newRows.map(r => {
      let s = r[column] == null ? "" : String(r[column]);

      if (trim) s = s.trim();
      if (lowercase) s = s.toLowerCase();
      if (removeSpecial) s = s.replace(/[^\w\s\-]/g, "");
      if (collapseSpaces) s = s.replace(/\s+/g, " ");

      r[column] = s;
      return r;
    });
  }

  // DATE EXTRACT
  else if (op === "extract_date") {
    const { column, part } = step;
    const outCol = `${column}_${part}`;

    newCols.push({ headerName: outCol, field: outCol, editable: false });

    newRows = newRows.map(r => {
      const d = new Date(r[column]);
      if (isNaN(d.getTime())) {
        r[outCol] = null;
      } else {
        if (part === "year") r[outCol] = d.getFullYear();
        else if (part === "month") r[outCol] = d.getMonth() + 1;
        else if (part === "day") r[outCol] = d.getDate();
      }
      return r;
    });
  }

  return { newRows, newCols };
}


// --------------------------------------------------
// MAIN TRANSFORM PANEL COMPONENT
// --------------------------------------------------
const TransformPanel = ({ onApplyStep, onPreviewStep }) => {

  const [openTab, setOpenTab] = React.useState("columns");

  const tabs = [
    { id: "columns", label: "Columns", icon: Columns },
    { id: "missing", label: "Missing", icon: Droplets },
    { id: "encode", label: "Encode", icon: Binary },
    { id: "scale", label: "Scale", icon: Ruler },
    { id: "text", label: "Text", icon: FileText },
    { id: "date", label: "Date", icon: Calendar },
  ];

  return (
    <aside className="w-96 bg-white rounded-2xl border border-gray-200 shadow-[0_0_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white">
        <h3 className="text-lg font-semibold tracking-tight">Transform Operations</h3>
        <p className="text-xs text-gray-500 mt-1">
          Apply changes to your dataset
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = openTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setOpenTab(tab.id)}
                className={`
                  group relative flex items-center justify-center gap-2 px-3 py-2
                  rounded-lg text-xs font-medium transition-all
                  ${active ? "bg-black text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>

                {/* Active underline */}
                {active && (
                  <div className="absolute -bottom-1 left-0 right-0 mx-auto w-2/3 h-[2px] bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6 overflow-y-auto max-h-[70vh] transition-all duration-200">
        {openTab === "columns" && (
          <ColumnOperations onApply={(step) => onApplyStep(step)} onPreview={(step) => onPreviewStep(step)}/>
        )}
        {openTab === "missing" && (
          <MissingValuePanel onApply={(step) => onApplyStep(step)} onPreview={(step) => onPreviewStep(step)}/>
        )}
        {openTab === "encode" && (
          <EncodingPanel onApply={(step) => onApplyStep(step)} onPreview={(step) => onPreviewStep(step)}/>
        )}
        {openTab === "scale" && (
          <ScalingPanel onApply={(step) => onApplyStep(step)} onPreview={(step) => onPreviewStep(step)}/>
        )}
        {openTab === "text" && (
          <TextCleanPanel onApply={(step) => onApplyStep(step)}onPreview={(step) => onPreviewStep(step)} />
        )}
        {openTab === "date" && (
          <DateExtractPanel onApply={(step) => onApplyStep(step)}onPreview={(step) => onPreviewStep(step)} />
        )}
      </div>
    </aside>
  );
};



// EXPORTS
TransformPanel.applyStep = (rows, cols, step) => applyStepLocal(rows, cols, step);
export default TransformPanel;
