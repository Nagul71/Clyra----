// src/components/projects/ProjectList.jsx
import React from "react";
import ProjectCard from "./ProjectCard";

export default function ProjectList({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm">
        No projects yet — create your first one.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
