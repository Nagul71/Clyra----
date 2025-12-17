from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import PreviewRequest, PipelineRequest
from utils import load_csv_from_url
from pipeline_engine import apply_step, run_pipeline
from storage import upload_processed_csv
from supabase_client import supabase

import numpy as np

app = FastAPI(title="Clyra Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def to_json_safe(df):
    return df.replace({np.nan: None}).to_dict(orient="records")


@app.get("/ping")
def ping():
    return {"message": "backend alive"}


@app.post("/preview-step")
def preview_step(req: PreviewRequest):
    df = load_csv_from_url(req.dataset_url)
    before = df.head(50).copy()

    # make sure step is passed as dict with aliases (so "from" alias is handled)
    try:
        step_dict = req.step.dict(by_alias=True)
# pass through from_col -> backend
    except Exception:
        # pydantic v2
        try:
            step_dict = req.step.model_dump()
            if "from" in step_dict and "from_" not in step_dict:
                step_dict["from_"] = step_dict["from"]
        except Exception:
            step_dict = {}

    after = apply_step(before.copy(), step_dict)

    return {
        "before": to_json_safe(before),
        "after": to_json_safe(after),
    }


@app.post("/apply-pipeline")
def apply_pipeline(req: PipelineRequest):
    from utils import load_csv_from_url
    import pandas as pd
    import json
    import numpy as np
    from io import StringIO

    print("REQ BODY:", req.dict())

    dataset_url = req.dataset_url
    project_id = req.project_id
    user_id = req.user_id
    steps = req.pipeline

    # You MUST already store the Supabase file path in DB (frontend sends dataset_path)
    file_path = req.dataset_path  # frontend must send this (added)

    if not file_path:
        raise Exception("dataset_path missing from request. Frontend must send the file_path stored in Supabase.")

    # Load original CSV
    df = load_csv_from_url(dataset_url)
    print("Loaded CSV:", df.shape)

    # Normalize pipeline
    pipeline = []
    for s in steps:
        try:
            sd = s.dict(by_alias=True)
        except:
            try:
                sd = s.model_dump()
            except:
                sd = dict(s)
        pipeline.append(sd)

    print("PIPELINE:", pipeline)

    # Apply pipeline
    df_clean = run_pipeline(df, pipeline)
    print("After pipeline:", df_clean.shape)

    # ---- Convert DF -> CSV bytes ----
    csv_buffer = StringIO()
    df_clean.to_csv(csv_buffer, index=False)
    output_bytes = csv_buffer.getvalue().encode("utf-8")

    # ---- OVERWRITE SAME FILE IN SUPABASE STORAGE ----
    # update() replaces the same file
    try:
        supabase.storage.from_("datasets").update(
            file_path,
            output_bytes,
            {"content-type": "text/csv"}
        )
    except Exception as e:
        print("Error updating Supabase file:", e)
        raise

    # ---- Generate public URL ----
    public_url = supabase.storage.from_("datasets").get_public_url(file_path)
    processed_url = public_url  # string, no .get("publicUrl")

    # ---- Update database entry (overwrite previous metadata) ----
    update_result = supabase.table("datasets").update({
        "file_url": processed_url,
        "rows": len(df_clean),
        "columns": list(df_clean.columns),
    }).eq("file_path", file_path).execute()

    print("DB UPDATE RESULT:", update_result)

    return {"processed_url": processed_url}


@app.post("/profile-dataset")
def profile_dataset(req: dict):
    from utils import load_csv_from_url
    import pandas as pd
    import numpy as np

    dataset_url = req.get("dataset_url")
    if not dataset_url:
        return {"error": "dataset_url missing"}

    df = load_csv_from_url(dataset_url)

    profile = {
        "summary": {
            "rows": len(df),
            "columns": len(df.columns),
            "duplicate_rows": int(df.duplicated().sum()),
            "missing_cells": int(df.isna().sum().sum()),
            "missing_percent": float(df.isna().sum().sum() / (len(df) * len(df.columns)) * 100),
        },
        "columns": {}
    }

    for col in df.columns:
        series = df[col]

        col_stats = {
            "dtype": str(series.dtype),
            "unique_count": int(series.nunique()),
            "missing_count": int(series.isna().sum()),
            "missing_percent": float(series.isna().mean() * 100),
        }

        # numeric stats
        if pd.api.types.is_numeric_dtype(series):
            numeric = pd.to_numeric(series, errors="coerce")
            col_stats.update({
                "min": float(numeric.min()) if not np.isnan(numeric.min()) else None,
                "max": float(numeric.max()) if not np.isnan(numeric.max()) else None,
                "mean": float(numeric.mean()) if not np.isnan(numeric.mean()) else None,
                "median": float(numeric.median()) if not np.isnan(numeric.median()) else None,
                "std": float(numeric.std()) if not np.isnan(numeric.std()) else None,
            })

        # top values
        vc = series.value_counts().head(5)
        col_stats["top_values"] = [
            {"value": str(idx), "count": int(count)}
            for idx, count in vc.items()
        ]

        profile["columns"][col] = col_stats

    return profile



from ai_engine import generate_ai_suggestions

@app.post("/ai-suggestions")
def ai_suggestions(req: dict):
    profile = req.get("profile")
    if not profile:
        return {"error": "profile missing"}

    suggestions = generate_ai_suggestions(profile)
    return {"suggestions": suggestions}

