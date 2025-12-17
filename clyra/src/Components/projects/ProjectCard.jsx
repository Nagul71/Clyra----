// src/components/projects/ProjectCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FolderOpen, ChevronRight, Calendar } from "lucide-react";

export default function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left Side - Project Info */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-gray-100 transition-colors">
              <FolderOpen className="w-6 h-6 text-gray-600" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-semibold truncate group-hover:text-black transition-colors">
                {project.name}
              </h4>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 group-hover:bg-gray-50 rounded-full text-xs font-medium text-gray-700 transition-colors">
                  {project.goal === 'tabular' && 'Tabular Data'}
                  {project.goal === 'nlp' && 'NLP'}
                  {project.goal === 'timeseries' && 'Time Series'}
                  {project.goal === 'vision' && 'Computer Vision'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Action */}
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600 group-hover:text-black transition-colors flex-shrink-0">
            <span>Open</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}