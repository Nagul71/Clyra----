# backend/pipeline_runner.py
import pandas as pd
import numpy as np
from typing import List, Dict

def apply_steps(df: pd.DataFrame, steps: List[Dict]) -> pd.DataFrame:
    df = df.copy()

    for step in steps:
        op = step.get("op")
        if op == "drop_column":
            col = step.get("column")
            if col in df.columns:
                df = df.drop(columns=[col])

        elif op == "rename_column":
            frm = step.get("from") or step.get("column")
            to = step.get("to")
            if frm in df.columns and to:
                df = df.rename(columns={frm: to})

        elif op == "change_type":
            col = step.get("column")
            toType = step.get("toType")
            if col in df.columns:
                if toType == "numeric":
                    df[col] = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
                elif toType == "string":
                    df[col] = df[col].astype(str)
                elif toType == "boolean":
                    df[col] = df[col].astype(str).str.lower().isin(["1", "true", "yes"])
                elif toType == "datetime":
                    df[col] = pd.to_datetime(df[col], errors="coerce")

        elif op == "remove_duplicates":
            cols = step.get("byColumns") or []
            if len(cols) == 0:
                df = df.drop_duplicates()
            else:
                df = df.drop_duplicates(subset=cols)

        elif op == "replace_values":
            col = step.get("column")
            frm = step.get("from")
            to = step.get("to")
            if col in df.columns:
                df[col] = df[col].replace(frm, to)

        elif op == "impute":
            col = step.get("column")
            strategy = step.get("strategy")
            value = step.get("value")
            if col in df.columns:
                if strategy == "custom":
                    df[col] = df[col].fillna(value)
                else:
                    if strategy in ("mean", "median"):
                        numeric = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
                        if strategy == "mean":
                            fill = numeric.mean()
                        else:
                            fill = numeric.median()
                        df[col] = df[col].fillna(fill)
                    elif strategy == "mode":
                        fill = df[col].mode(dropna=True)
                        fillval = None
                        if len(fill) > 0:
                            fillval = fill.iloc[0]
                        df[col] = df[col].fillna(fillval)

        elif op == "one_hot":
            col = step.get("column")
            if col in df.columns:
                dummies = pd.get_dummies(df[col], prefix=col)
                df = pd.concat([df, dummies], axis=1)

        elif op == "label_encode":
            col = step.get("column")
            if col in df.columns:
                df[f"{col}_label"] = pd.factorize(df[col])[0]

        elif op in ("scale_minmax", "scale_standard", "scale_robust"):
            col = step.get("column")
            if col in df.columns:
                numeric = pd.to_numeric(df[col].astype(str).str.replace(",", ""), errors="coerce")
                if op == "scale_minmax":
                    mn = numeric.min()
                    mx = numeric.max()
                    df[f"{col}_minmax"] = numeric.apply(lambda x: (x - mn) / (mx - mn) if pd.notna(x) and mx != mn else np.nan)
                elif op == "scale_standard":
                    mean = numeric.mean()
                    std = numeric.std()
                    df[f"{col}_std"] = numeric.apply(lambda x: (x - mean) / (std if std != 0 else 1) if pd.notna(x) else np.nan)
                elif op == "scale_robust":
                    q1 = numeric.quantile(0.25)
                    q3 = numeric.quantile(0.75)
                    iqr = q3 - q1 if q3 != q1 else 1
                    med = numeric.median()
                    df[f"{col}_robust"] = numeric.apply(lambda x: (x - med) / iqr if pd.notna(x) else np.nan)

        elif op == "text_clean":
            col = step.get("column")
            if col in df.columns:
                s = df[col].astype(str).fillna("")
                if step.get("trim"):
                    s = s.str.strip()
                if step.get("lowercase"):
                    s = s.str.lower()
                if step.get("removeSpecial"):
                    s = s.str.replace(r"[^\w\s\-]", "", regex=True)
                if step.get("collapseSpaces"):
                    s = s.str.replace(r"\s+", " ", regex=True)
                df[col] = s

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

        # unknown ops are skipped

    return df
