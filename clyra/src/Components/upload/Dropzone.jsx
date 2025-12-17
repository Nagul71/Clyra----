// src/components/upload/Dropzone.jsx
import React, { useCallback, useRef, useState } from "react";

export default function Dropzone({ onFile }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef();

  const accept = ".csv,application/json,.xlsx,.xls";

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  const onChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`border-dashed rounded-lg p-8 text-center transition ${
          dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white"
        }`}
        style={{ borderWidth: 2 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={onChange}
        />

        <div className="mx-auto max-w-lg">
          <p className="text-lg font-medium">Drag & drop your dataset</p>
          <p className="mt-2 text-sm text-gray-500">CSV, JSON, XLSX (first sheet)</p>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Choose file
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
