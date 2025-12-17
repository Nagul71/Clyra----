// src/pages/UploadPage.jsx
import React, { useState } from "react";
import Dropzone from "../Components/upload/Dropzone";
import DatasetPreview from "../Components/upload/DataSetPreview";
import { parseFile } from "../utils/parseFile";
import { inferDtypes } from "../utils/inferDtypes";
import { supabase } from "../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UploadPage() {
  const { id: projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [dtypes, setDtypes] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const onFile = async (f) => {
    setError(null);
    setFile(f);
    setMeta(null);
    setDtypes(null);

    try {
      const parsed = await parseFile(f, { sampleSize: 10 });
      parsed.fileName = f.name;
      parsed.sizeBytes = f.size;

      setMeta(parsed);
      setDtypes(inferDtypes(parsed.sampleRows));
    } catch (e) {
      setError(e.message || "Failed to parse file.");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setError(null);
    setUploading(true);

    try {
      // 🔥 SAFE, FLAT STORAGE PATH
      const timestamp = Date.now();
      const cleanName = file.name.replace(/\s+/g, "_");
      const path = `${projectId}-${user.id}-${timestamp}-${cleanName}`;

      console.log("Uploading to path:", path);

      // 🔥 UPLOAD
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("datasets")
        .upload(path, file, { upsert: false });

      // ❌ Upload failed → STOP immediately
      if (uploadError) {
        console.error("UPLOAD ERROR:", uploadError);
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      console.log("UPLOAD SUCCESS:", uploadData);

      // 🔥 GET CORRECT PUBLIC URL
      const { data: urlData } = supabase.storage
        .from("datasets")
        .getPublicUrl(path);

      const publicUrl = urlData.publicUrl;

      console.log("PUBLIC URL:", publicUrl);

      // INSERT METADATA INTO DB
const rowsCount = meta?.rows ?? null;

const { data: inserted, error: insertError } = await supabase
  .from("datasets")
  .insert({
    project_id: projectId,
    user_id: user.id,
    file_name: file.name,
    file_path: path,         // KEEP THIS
    file_url: publicUrl,     // optional but useful
    file_type: meta?.fileType ?? file.type,
    rows: rowsCount,
    columns: meta?.columns ?? [],
    sample_rows: meta?.sampleRows ?? [],
    dtypes: dtypes ?? {},
    size_bytes: file.size,
  })
  .select(); // <<< GET INSERTED ROW BACK

if (insertError) {
  console.error("DB INSERT ERROR:", insertError);
  throw insertError;
}

// GET THE DATASET ID
const datasetId = inserted[0].id;

// 🚀 NOW GO TO THE EDITOR
navigate(`/editor/${datasetId}`);

    } catch (e) {
      console.error("UPLOAD FAILED:", e);
      setError(e.message || "Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Upload Dataset</h1>
            <p className="text-sm text-gray-500">Upload a CSV / Excel / JSON file for preprocessing.</p>
          </div>
        </header>

        <Dropzone onFile={onFile} />

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
        )}

        {meta && (
          <>
            <DatasetPreview meta={meta} dtypes={dtypes} />

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {uploading ? "Uploading..." : "Upload & Save"}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setMeta(null);
                  setDtypes(null);
                }}
                className="rounded-md border px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
