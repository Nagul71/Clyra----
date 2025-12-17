import React from "react";
import { Undo2, Redo2, Download, Save, Eye, PlayCircle } from "lucide-react";

export default function Toolbar({
  pipeline,
  onUndo,
  onRedo,
  onExport,
  onSave,
  onPreviewServer,
  onApplyServer,
  onPreviewPipeline
}) {
  return (
    <div className="flex items-center justify-between">
      {/* Left - Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onUndo}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Undo</span>
        </button>

        <button
          onClick={onRedo}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-lg transition-all"
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
          <span className="hidden sm:inline">Redo</span>
        </button>

        <div className="h-5 w-px bg-gray-200 mx-1"></div>


      </div>

      {/* Right - Primary Actions */}
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 rounded-lg">
          {pipeline?.steps?.length ?? 0} steps
        </div>

        {/* <button
          onClick={onPreviewServer}
          className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition-all font-medium"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button> */}

          <button onClick={onPreviewPipeline}
          className="flex items-center gap-2 px-4 py-1.5 text-sm text-gray-700 hover:text-black border border-gray-200 hover:border-gray-300 rounded-lg transition-all font-medium">
          Before/After
        </button>
        <button
          onClick={onApplyServer}
          className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-black hover:bg-gray-800 rounded-lg transition-all font-medium"
        >
          <PlayCircle className="w-4 h-4" />
          Apply Pipeline
        </button>

      </div>
    </div>
  );
}
