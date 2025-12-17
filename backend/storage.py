import os
import uuid
import pandas as pd
from io import BytesIO
from supabase_client import supabase

PROCESSED_BUCKET = os.getenv("PROCESSED_BUCKET", "processed-datasets")


def upload_processed_csv(df: pd.DataFrame, project_id: str, user_id: str) -> str:
    """Upload DataFrame to Supabase storage and return a public URL.

    This function is defensive: it works with different supabase SDK return shapes.
    """
    buffer = BytesIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)

    file_name = f"{project_id}_{user_id}_{uuid.uuid4()}.csv"
    file_path = file_name

    # upload raw bytes
    # different SDK versions expect different parameter names; the v2 client used in this project
    # accepts (path, file, file_options) or (path, file_bytes, options) depending on wrapper.
    try:
        resp = supabase.storage.from_(PROCESSED_BUCKET).upload(
            file_path,
            buffer.getvalue(),
            {"content-type": "text/csv"},
        )
    except TypeError:
        # fallback signature
        resp = supabase.storage.from_(PROCESSED_BUCKET).upload(file_path, buffer.getvalue())

    # Debug/compat checks
    try:
        # v2 may return an object-like UploadResponse
        if hasattr(resp, "error") and resp.error:
            raise Exception(f"Upload failed: {resp.error}")
        # v1 may return dict with 'error'
        if isinstance(resp, dict) and resp.get("error"):
            raise Exception(f"Upload failed: {resp.get('error')}")
    except Exception:
        # print to help debugging then re-raise
        print("UPLOAD ERROR:", resp)
        raise

    # fetch public URL
    url_resp = supabase.storage.from_(PROCESSED_BUCKET).get_public_url(file_path)

    # try different shapes
    public_url = None
    if isinstance(url_resp, dict):
        public_url = url_resp.get("publicUrl") or (url_resp.get("data") or {}).get("publicUrl")
    else:
        # object-like
        public_url = getattr(url_resp, "public_url", None) or getattr(url_resp, "publicUrl", None)

    # as a last resort, construct the conventional public path for Supabase storage
    if not public_url and supabase:
        base = os.getenv("SUPABASE_URL")
        if base:
            public_url = f"{base}/storage/v1/object/public/{PROCESSED_BUCKET}/{file_path}"

    if not public_url:
        raise Exception("Failed to obtain public URL from Supabase response")

    return public_url