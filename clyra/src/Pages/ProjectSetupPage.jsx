// src/pages/ProjectSetupPage.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function ProjectSetupPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProject() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (!mounted) return;
      if (!error) setProject(data);
      setLoading(false);
    }

    loadProject();
    return () => (mounted = false);
  }, [id]);

  if (loading)
    return <div className="p-6 text-gray-500">Loading project...</div>;

  if (!project)
    return <div className="p-6 text-red-600">Project not found.</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">{project.name}</h1>
        <p className="text-sm text-gray-500">Goal: {project.goal}</p>

        <div className="mt-6">
          <p className="text-sm">When ready, upload your dataset.</p>

          <button
            onClick={() => navigate(`/projects/${id}/upload`)}
            className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
          >
            Go to Dataset Upload
          </button>
        </div>
      </div>
    </div>
  );
}
