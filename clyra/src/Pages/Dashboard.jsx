// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import CreateProjectModal from "../Components/projects/CreateProjectModal";
import ProjectList from "../Components/projects/ProjectList";
import { Plus, LogOut, Sparkles } from "lucide-react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProjects() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (!mounted) return;

      if (!error) setProjects(data);
      setLoading(false);
    }

    if (user) loadProjects();
    return () => (mounted = false);
  }, [user]);

  const onCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    setCreating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold">Clyra</span>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.email?.[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user?.email?.split('@')[0]}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Projects</h1>
              <p className="text-base text-gray-600">
                {projects.length === 0 
                  ? "Create your first project to get started"
                  : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} total`
                }
              </p>
            </div>

            <button
              onClick={() => setCreating(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-gray-800 text-white text-sm rounded-full transition-all font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>
        </div>

        {/* Projects Content */}
        <main>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500">Loading projects</p>
              </div>
            </div>
          ) : (
            <ProjectList projects={projects} />
          )}
        </main>
      </div>

      {/* Create Project Modal */}
      {creating && (
        <CreateProjectModal 
          userId={user?.id} 
          onCreated={onCreated}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}