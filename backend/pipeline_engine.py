import pandas as pd
import numpy as np
from typing import Any


def normalize_step(step: Any) -> dict:
    """Return plain dict with alias support."""
    if isinstance(step, dict):
        return step

    try:
        return step.dict(by_alias=True)
    except:
        pass

    try:
        d = step.model_dump()
        if "from" in d and "from_" not in d:
            d["from_"] = d["from"]
        return d
    except:
        pass

    try:
        return dict(step)
    except:
        return {}


def apply_step(df: pd.DataFrame, raw_step: Any) -> pd.DataFrame:
    step = normalize_step(raw_step)
    op = step.get("op")

    # ---------------------------
    # DROP COLUMN
    # ---------------------------
    if op == "drop_column":
        col = step.get("column")
        if col in df.columns:
            df = df.drop(columns=[col])

    # ---------------------------
    # RENAME COLUMN
    # ---------------------------
    elif op == "rename_column":
        old = step.get("from_") or step.get("from_col") or step.get("from") or step.get("column")
        new = step.get("to")
        if old in df.columns and new:
            df = df.rename(columns={old: new})

    # ---------------------------
    # CHANGE TYPE
    # ---------------------------
    elif op == "change_type":
        col = step.get("column")
        to_type = step.get("to_type")
        if col in df.columns:
            if to_type == "numeric":
                df[col] = pd.to_numeric(df[col], errors="coerce")
            elif to_type == "string":
                df[col] = df[col].astype(str)
            elif to_type == "boolean":
                df[col] = df[col].astype(str).str.lower().isin(["1", "true", "yes"])
            elif to_type == "datetime":
                df[col] = pd.to_datetime(df[col], errors="coerce")

    # ---------------------------
    # REMOVE DUPLICATES
    # ---------------------------
    elif op == "remove_duplicates":
        cols = step.get("columns") or []
        if cols:
            df = df.drop_duplicates(subset=cols)
        else:
            df = df.drop_duplicates()

    # ---------------------------
    # IMPUTE
    # ---------------------------
    elif op == "impute":
        col = step.get("column")
        strategy = step.get("strategy")
        value = step.get("value")

        if col in df.columns:
            numeric = pd.to_numeric(df[col], errors="coerce")
            if strategy == "mean":
                df[col] = df[col].fillna(numeric.mean())
            elif strategy == "median":
                df[col] = df[col].fillna(numeric.median())
            elif strategy == "mode":
                df[col] = df[col].fillna(df[col].mode().iloc[0])
            else:
                df[col] = df[col].fillna(value)

    # ---------------------------
    # REPLACE VALUES
    # ---------------------------
    elif op == "replace_values":
        col = step.get("column")
        frm = step.get("from") or step.get("from_value")
        to = step.get("to") or step.get("to_value")
        if col in df.columns:
            df[col] = df[col].replace(frm, to)

    # ---------------------------
    # ONE HOT
    # ---------------------------
    elif op == "one_hot":
        col = step.get("column")
        if col in df.columns:
            dummies = pd.get_dummies(df[col], prefix=col)
            df = df.join(dummies)
            # remove original column
            df = df.drop(columns=[col])

    # ---------------------------
    # LABEL ENCODE
    # ---------------------------
    elif op == "label_encode":
        col = step.get("column")
        if col in df.columns:
            df[col + "_label"] = df[col].astype("category").cat.codes

    # ---------------------------
    # SCALING
    # ---------------------------
    elif op == "scale_minmax":
        col = step.get("column")
        if col in df.columns:
            s = pd.to_numeric(df[col], errors="coerce")
            df[col + "_minmax"] = (s - s.min()) / (s.max() - s.min())

    elif op == "scale_standard":
        col = step.get("column")
        if col in df.columns:
            s = pd.to_numeric(df[col], errors="coerce")
            df[col + "_std"] = (s - s.mean()) / (s.std() or 1)

    elif op == "scale_robust":
        col = step.get("column")
        if col in df.columns:
            s = pd.to_numeric(df[col], errors="coerce")
            q1, q3 = s.quantile(0.25), s.quantile(0.75)
            df[col + "_robust"] = (s - (q1 + q3) / 2) / (q3 - q1 or 1)

    # ---------------------------
    # TEXT CLEAN
    # ---------------------------
    elif op == "text_clean":
        col = step.get("column")
        if col in df.columns:
            series = df[col].astype(str)

            if step.get("trim"):
                series = series.str.strip()
            if step.get("lowercase"):
                series = series.str.lower()
            if step.get("removeSpecial"):
                series = series.str.replace(r"[^\w\s\-]", "", regex=True)
            if step.get("collapseSpaces"):
                series = series.str.replace(r"\s+", " ", regex=True)

            df[col] = series

    # ---------------------------
    # DATE EXTRACT
    # ---------------------------
    elif op == "extract_date":
        col = step.get("column")
        part = step.get("part")
        if col in df.columns:
            d = pd.to_datetime(df[col], errors="coerce")
            if part == "year":
                df[f"{col}_year"] = d.dt.year
            elif part == "month":
                df[f"{col}_month"] = d.dt.month
            elif part == "day":
                df[f"{col}_day"] = d.dt.day

    return df


def run_pipeline(df: pd.DataFrame, pipeline: list) -> pd.DataFrame:
    for s in pipeline:
        df = apply_step(df.copy(), s)
    return df
