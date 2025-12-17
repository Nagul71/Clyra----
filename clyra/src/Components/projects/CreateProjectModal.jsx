// src/components/projects/CreateProjectModal.jsx
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, FolderPlus } from "lucide-react";

export default function CreateProjectModal({ userId, onCreated, onClose }) {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("tabular");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProject = async () => {
    setError(null);

    if (!name.trim()) {
      setError("Please give your project a name.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: userId,
        name: name.trim(),
        goal,
      })
      .select();

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    onCreated?.(data?.[0]);
    onClose?.();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      createProject();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <FolderPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Create Project</h3>
              <p className="text-xs text-gray-500">
                Set up a new ML project
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-5 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Project Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="My ML Project"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all"
              autoFocus
            />
          </div>

          {/* ML Goal */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              ML Goal
            </label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all bg-white cursor-pointer"
            >
              <option value="tabular">Tabular Data</option>
              <option value="nlp">Natural Language Processing</option>
              <option value="timeseries">Time Series Analysis</option>
              <option value="vision">Computer Vision</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded-full transition-all font-medium"
          >
            Cancel
          </button>

          <button
            onClick={createProject}
            disabled={loading || !name.trim()}
            className="px-6 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating...
              </span>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}