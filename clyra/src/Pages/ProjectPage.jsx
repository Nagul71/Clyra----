// src/pages/ProjectPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Upload, FileText, Calendar, ChevronRight, FolderOpen } from "lucide-react";

export default function ProjectPage() {
  const { id: projectId } = useParams();

  const [project, setProject] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Load project
        const { data: proj, error: projErr } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projErr) throw projErr;
        setProject(proj);

        // Load datasets
        const { data: ds, error: dsErr } = await supabase
          .from("datasets")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });

        if (dsErr) throw dsErr;
        setDatasets(ds);
      } catch (e) {
        console.error("ProjectPage error:", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-500">Loading project</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="text-sm text-gray-600 hover:text-black transition-colors"
              >
                ← All Projects
              </Link>
              <div className="h-5 w-px bg-gray-200"></div>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-gray-400" />
                <h1 className="text-lg font-semibold">{project.name}</h1>
              </div>
            </div>

            <Link
              to={`/projects/${projectId}/upload`}
              className="flex items-center gap-2 px-5 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload Dataset
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Project Info Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">
                  {project.goal}
                </span>
                <span className="text-gray-400">·</span>
                <span>{datasets.length} {datasets.length === 1 ? 'dataset' : 'datasets'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Datasets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Datasets</h2>
            {datasets.length > 0 && (
              <span className="text-sm text-gray-500">
                {datasets.length} total
              </span>
            )}
          </div>

          {datasets.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No datasets yet</h3>
              <p className="text-gray-500 mb-6">
                Upload your first dataset to get started with data preprocessing
              </p>
              <Link
                to={`/projects/${projectId}/upload`}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {datasets.map((ds) => (
                <Link
                  key={ds.id}
                  to={`/editor/${ds.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
                >
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {/* File Icon */}
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base mb-1 truncate group-hover:text-black transition-colors">
                          {ds.file_name}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(ds.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-gray-300">·</span>
                          <span>
                            {new Date(ds.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-black transition-colors">
                      <span>Open</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}