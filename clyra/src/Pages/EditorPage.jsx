// src/pages/EditorPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Papa from "papaparse";
import { ChevronLeft, BarChart3, Download, Save, Sparkles, Settings, BarChart2 } from "lucide-react";

import GridTable from "../components/editor/GridTable";
import Toolbar from "../components/editor/Toolbar";
import ProfilingModal from "../Components/editor/ProfilingModel";
import TransformPanel from "../Components/editor/TransformPanel";
import PreviewModal from "../Components/editor/PreviewModal";
import VisualizationPanel from "../Components/editor/VisualizationPanel";

export default function EditorPage() {
  const { datasetId } = useParams();
  const navigate = useNavigate();

  // -------------------- DATA STATES --------------------
  const [meta, setMeta] = useState(null);
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);

  // Immutable base (IMPORTANT)
  const [originalRows, setOriginalRows] = useState([]);
  const [originalCols, setOriginalCols] = useState([]);

  // -------------------- PIPELINE --------------------
  const [pipeline, setPipeline] = useState({ steps: [] });
  const [redoStack, setRedoStack] = useState([]);

  // -------------------- UI --------------------
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [profile, setProfile] = useState(null);

  // Right panel mode: transform | ai | visualize
  const [rightPanel, setRightPanel] = useState("transform");

  // -------------------- AI --------------------
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // -------------------- VISUALIZATION --------------------
  const [visualizations, setVisualizations] = useState([]);

  // =====================================================
  // HELPERS
  // =====================================================
  async function resolvePublicUrl(meta) {
    if (!meta) return null;
    if (meta.file_url) return meta.file_url;

    if (meta.file_path) {
      const { data } = await supabase.storage
        .from("datasets")
        .getPublicUrl(meta.file_path);
      return data?.publicUrl || null;
    }
    return null;
  }

  // =====================================================
  // LOAD DATASET
  // =====================================================
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("datasets")
          .select("*")
          .eq("id", datasetId)
          .single();

        if (error) throw error;
        if (!mounted) return;

        setMeta(data);

        const url = await resolvePublicUrl(data);
        if (!url) throw new Error("Dataset URL missing");

        const text = await (await fetch(url + "?t=" + Date.now())).text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });

        const fields = parsed.meta.fields || [];
        const sampleRows = parsed.data.slice(0, 500);

        const colDefs = fields.map(f => ({
          headerName: f,
          field: f,
          editable: true,
          sortable: true,
          filter: true,
          resizable: true
        }));

        setRows(sampleRows);
        setCols(colDefs);

        // IMPORTANT — set immutable base
        setOriginalRows(JSON.parse(JSON.stringify(sampleRows)));
        setOriginalCols(JSON.parse(JSON.stringify(colDefs)));

      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, [datasetId]);

  // =====================================================
  // LOAD VISUALIZATIONS
  // =====================================================
  useEffect(() => {
    if (!datasetId) return;
    supabase
      .from("visualizations")
      .select("*")
      .eq("dataset_id", datasetId)
      .then(({ data }) => setVisualizations(data || []));
  }, [datasetId]);

  // =====================================================
  // PIPELINE LOGIC (DETERMINISTIC)
  // =====================================================
  const recomputeFromOriginal = (steps) => {
    let r = JSON.parse(JSON.stringify(originalRows));
    let c = JSON.parse(JSON.stringify(originalCols));

    for (const s of steps) {
      const out = TransformPanel.applyStep(r, c, s);
      r = out.newRows;
      c = out.newCols;
    }
    setRows(r);
    setCols(c);
  };

  const applyStep = useCallback((step) => {
    setPipeline(p => {
      const steps = [...p.steps, step];
      recomputeFromOriginal(steps);
      setRedoStack([]);
      return { steps };
    });
  }, [originalRows, originalCols]);

  const undoLast = useCallback(() => {
    setPipeline(p => {
      if (!p.steps.length) return p;
      setRedoStack(r => [...r, p.steps[p.steps.length - 1]]);
      const steps = p.steps.slice(0, -1);
      recomputeFromOriginal(steps);
      return { steps };
    });
  }, [originalRows, originalCols]);

  const redoLast = useCallback(() => {
    setRedoStack(r => {
      if (!r.length) return r;
      const step = r[r.length - 1];
      setPipeline(p => {
        const steps = [...p.steps, step];
        recomputeFromOriginal(steps);
        return { steps };
      });
      return r.slice(0, -1);
    });
  }, [originalRows, originalCols]);

  // =====================================================
  // PREVIEW (FULL PIPELINE ONLY)
  // =====================================================
  const previewFullPipeline = () => {
    if (!pipeline.steps.length) {
      alert("Apply at least one operation first");
      return;
    }

    let before = JSON.parse(JSON.stringify(originalRows.slice(0, 50)));
    let after = JSON.parse(JSON.stringify(originalRows.slice(0, 50)));
    let afterCols = JSON.parse(JSON.stringify(originalCols));

    for (const step of pipeline.steps) {
      const out = TransformPanel.applyStep(after, afterCols, step);
      after = out.newRows;
      afterCols = out.newCols;
    }

    setPreview({ before, after });
  };

  const previewStepLocal = (step) => {
    const before = JSON.parse(JSON.stringify(rows));
    const out = TransformPanel.applyStep(rows, cols, step);
    const after = out.newRows;
    setPreview({ before, after });
  };

  // =====================================================
  // APPLY PIPELINE (OVERWRITE SAME DATASET)
  // =====================================================
  const applyPipelineServer = async () => {
    const dataset_url = await resolvePublicUrl(meta);

    const res = await fetch("http://127.0.0.1:8000/apply-pipeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: datasetId,
        dataset_path: meta.file_path,
        dataset_url,
        pipeline: pipeline.steps,
        project_id: meta.project_id,
        user_id: meta.user_id
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error("Apply failed");

    const freshUrl = data.processed_url + "?t=" + Date.now();
    const text = await (await fetch(freshUrl)).text();
    const parsed = Papa.parse(text, { header: true });

    const newCols = parsed.meta.fields.map(f => ({
      headerName: f,
      field: f,
      editable: true,
      sortable: true,
      filter: true,
      resizable: true
    }));

    setRows(parsed.data);
    setCols(newCols);
    setOriginalRows(parsed.data);
    setOriginalCols(newCols);

    setMeta(m => ({ ...m, file_url: freshUrl }));
    alert("Dataset updated successfully");
  };

  // =====================================================
  // PROFILING
  // =====================================================
  const openProfiling = async () => {
    try {
      const dataset_url = await resolvePublicUrl(meta);

      const res = await fetch("http://127.0.0.1:8000/profile-dataset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset_url }),
      });

      const data = await res.json();
      setProfile(data);
    } catch (e) {
      alert("Profiling failed: " + e.message);
    }
  };

  // =====================================================
  // AI SUGGESTIONS
  // =====================================================
  const openAISuggestions = async () => {
    const dataset_url = await resolvePublicUrl(meta);

    const profileRes = await fetch("http://127.0.0.1:8000/profile-dataset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_url })
    });

    const profile = await profileRes.json();

    const aiRes = await fetch("http://127.0.0.1:8000/ai-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile })
    });

    const data = await aiRes.json();
    setAiSuggestions(data.suggestions || []);
  };

  // =====================================================
  // VISUALIZATION CRUD
  // =====================================================
  const addVisualization = async (viz) => {
    const { data } = await supabase
      .from("visualizations")
      .insert({ dataset_id: datasetId, ...viz })
      .select()
      .single();

    setVisualizations(v => [...v, data]);
  };

  const deleteVisualization = async (id) => {
    await supabase.from("visualizations").delete().eq("id", id);
    setVisualizations(v => v.filter(x => x.id !== id));
  };

  // =====================================================
  // EXPORT / SAVE
  // =====================================================
  const exportCSV = () => {
    const header = cols.map((c) => c.field).join(",");
    const body = rows
      .map((row) => cols.map((c) => JSON.stringify(row[c.field] ?? "")).join(","))
      .join("\n");

    const csv = header + "\n" + body;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${(meta?.file_name || "dataset").replace(".csv", "")}-cleaned.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const savePipelineToDB = async () => {
    try {
      const { error } = await supabase.from("pipelines").insert({
        dataset_id: datasetId,
        project_id: meta?.project_id,
        user_id: meta?.user_id,
        steps: pipeline.steps,
      });

      if (error) throw error;
      alert("Pipeline saved successfully");
    } catch (e) {
      console.error("Pipeline save error:", e);
      alert("Failed to save pipeline");
    }
  };

  // =====================================================
  // RENDER
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-sm font-medium text-gray-900">Loading dataset</p>
        </div>
      </div>
    );
  }

  if (!cols.length || !rows.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-sm font-medium text-gray-900">Processing dataset</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="px-8 py-3">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <button
                onClick={() => navigate(`/projects/${meta?.project_id}`)}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Projects
              </button>
              <div className="h-5 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">{meta?.file_name}</h1>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span>{rows.length} rows</span>
                  <span>·</span>
                  <span>{cols.length} columns</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={openProfiling}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                Profile
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={savePipelineToDB}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex gap-6">
          {/* Left Column - Data Grid & Pipeline */}
          <div className="flex-1 space-y-6">
            {/* Pipeline Steps */}
            {pipeline.steps.length > 0 && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900">Pipeline</h3>
                  <span className="text-xs font-medium text-gray-500">
                    {pipeline.steps.length} {pipeline.steps.length === 1 ? 'operation' : 'operations'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pipeline.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1.5 bg-white rounded-md text-xs font-medium text-gray-700 border border-gray-200"
                    >
                      {step.op || step.operation || JSON.stringify(step)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <Toolbar
                onPreviewPipeline={previewFullPipeline}
                pipeline={pipeline}
                onUndo={undoLast}
                onRedo={redoLast}
                onExport={exportCSV}
                onSave={savePipelineToDB}
                onApplyServer={applyPipelineServer}
              />
            </div>

            {/* Data Grid */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="text-sm font-semibold text-gray-900">Data</h3>
                <p className="text-xs text-gray-500 mt-1">First 500 rows</p>
              </div>
              <div className="p-4">
                <GridTable cols={cols} rows={rows} setRows={setRows} />
              </div>
            </div>
          </div>

          {/* Right Sidebar - 3 Tabs */}
          <div className="w-96 shrink-0">
            <div className="sticky top-24">
              {/* 3-Tab Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  onClick={() => setRightPanel("transform")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    rightPanel === "transform"
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Transform
                </button>
                <button
                  onClick={() => setRightPanel("ai")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    rightPanel === "ai"
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  AI
                </button>
                <button
                  onClick={() => setRightPanel("visualize")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    rightPanel === "visualize"
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <BarChart2 className="w-4 h-4" />
                  Charts
                </button>
              </div>

              {/* Content Area */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {rightPanel === "transform" && (
                  <TransformPanel 
                    onApplyStep={applyStep}
                    onPreviewStep={previewStepLocal}
                    pipeline={pipeline}
                    meta={meta}
                    setPreview={setPreview}
                  />
                )}

                {rightPanel === "ai" && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-900">AI Suggestions</h3>
                      <p className="text-xs text-gray-500 mt-1">Automated data quality improvements</p>
                    </div>

                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {aiSuggestions.length === 0 && (
                        <div className="text-center py-12">
                          <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 mb-4">No suggestions available</p>
                          <button
                            onClick={openAISuggestions}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
                          >
                            <Sparkles className="w-4 h-4" />
                            Generate Suggestions
                          </button>
                        </div>
                      )}

                      {aiSuggestions.length > 0 && aiSuggestions.map((suggestion, index) => (
                        <div 
                          key={index} 
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                        >
                          <h4 className="font-medium text-sm text-gray-900 mb-1">
                            {suggestion.title}
                          </h4>
                          <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                            {suggestion.description}
                          </p>
                          {suggestion.impact && (
                            <p className="text-xs text-gray-500 mb-3">
                              Impact: {suggestion.impact}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <button
                              className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-all"
                              onClick={() => {
                                applyStep(suggestion.operation);
                                setAiSuggestions(prev => prev.filter((_, idx) => idx !== index));
                              }}
                            >
                              Apply
                            </button>
                            <button
                              className="px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-medium text-gray-700 transition-all"
                              onClick={() => setAiSuggestions(prev => prev.filter((_, idx) => idx !== index))}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rightPanel === "visualize" && (
                  <VisualizationPanel
                    rows={rows}
                    visualizations={visualizations}
                    onAdd={addVisualization}
                    onDelete={deleteVisualization}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProfilingModal profile={profile} onClose={() => setProfile(null)} />
      <PreviewModal preview={preview} onClose={() => setPreview(null)} />
    </div>
  );
}