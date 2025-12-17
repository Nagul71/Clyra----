import os
import json
import time
import random
import logging
from typing import Any, Dict, List, Optional

import google.generativeai as genai
from google.api_core import exceptions

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# configure using new SDK format
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    logger.warning("GEMINI_API_KEY not set in environment — requests will fail without a valid key.")
genai.configure(api_key=API_KEY)

MODEL = "gemini-2.5-flash-lite"  # primary model to use
FALLBACK_MODEL = "gemini-2.0"  # optional fallback, only useful if you have quota for it


def _compact_json(obj: Any) -> str:
    # produce compact JSON string to reduce tokens
    return json.dumps(obj, separators=(",", ":"), ensure_ascii=False)


def _extract_retry_delay_from_exc(exc: Exception) -> Optional[float]:
    """
    Best-effort parse of "retry_delay" seconds from exception string details.
    Not guaranteed; used only if present in server message.
    """
    try:
        txt = str(exc)
        if "retry_delay" in txt:
            import re
            m = re.search(r"retry_delay[^\d]*(\d+(\.\d+)?)", txt)
            if m:
                return float(m.group(1))
    except Exception:
        pass
    return None


def _try_extract_text_from_response(response) -> str:
    """
    Defensive parsing of SDK response. Different SDK versions/fields may expose
    the generated text somewhere like .text, .output_text, .candidates, etc.
    Returns the first non-empty string found.
    """
    # 1) common: response.text
    try:
        text = getattr(response, "text", None)
        if text:
            return text
    except Exception:
        pass

    # 2) some responses provide choices/candidates list
    try:
        # .output[0].content[0].text  (or similar nested shape)
        if hasattr(response, "output") and response.output:
            # try a couple shapes
            out = response.output
            if isinstance(out, (list, tuple)) and len(out) > 0:
                first = out[0]
                # try nested content structure
                if hasattr(first, "content") and first.content:
                    cont = first.content
                    # cont may be list of dicts or objects
                    if isinstance(cont, (list, tuple)) and len(cont) > 0:
                        candidate = cont[0]
                        # try a number of attribute names
                        for key in ("text", "content", "plain_text", "output_text"):
                            val = getattr(candidate, key, None) if hasattr(candidate, key) else candidate.get(key) if isinstance(candidate, dict) else None
                            if val:
                                return val
                # try direct text on first
                for key in ("text", "content", "output_text", "plain_text"):
                    val = getattr(first, key, None) if hasattr(first, key) else first.get(key) if isinstance(first, dict) else None
                    if val:
                        return val
    except Exception:
        pass

    # 3) candidates or choices (dict-like)
    try:
        if hasattr(response, "candidates") and response.candidates:
            c0 = response.candidates[0]
            if isinstance(c0, dict):
                for k in ("text", "content"):
                    if k in c0 and c0[k]:
                        return c0[k]
            else:
                if getattr(c0, "text", None):
                    return c0.text
    except Exception:
        pass

    # 4) fallback to stringifying whole response
    try:
        return str(response)
    except Exception:
        return ""


def generate_ai_suggestions(profile_json: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Generate AI suggestions for dataset cleaning. Returns a list of suggestion dicts
    according to the strict schema; returns [] on parse failure.
    """

    prompt = """
You are a data cleaning expert for a no-code data wrangler platform.
You receive dataset profiling JSON.

Your job:
1. Identify issues (missing values, outliers, high cardinality, type issues)
2. Suggest best cleaning transformations
3. Output ONLY valid JSON in this exact schema:

[
  {
    "title": "Issue title",
    "description": "Explain clearly",
    "operation": {
        "op": "impute / drop_column / one_hot / label_encode / ...",
        "column": "ColumnName",
        "strategy": "median / mean / mode (if needed)",
        "value": "... (if needed)"
    }
  }
]

STRICT RULES:
- You must return ONLY JSON
- No markdown
- No ```json blocks
- No text outside JSON
- If no issues found, return []
""".strip()

    compact_profile = _compact_json(profile_json)
    request_text = f"{prompt}\n\nPROFILE:\n{compact_profile}"

    # Minimal request payload — adapt if your SDK supports richer params
    request_payload = {"prompt": request_text}

    # Attempt with exponential backoff + optional fallback model
    max_attempts = 4
    base_sleep = 1.0
    attempt = 0
    last_exc: Optional[Exception] = None

    while attempt < max_attempts:
        attempt += 1
        try:
            model = genai.GenerativeModel(MODEL)
            response = model.generate_content(request_payload["prompt"])
            raw_text = _try_extract_text_from_response(response).strip()

            # Clean any triple-backticks or stray fences just in case
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()

            # Try to parse JSON
            try:
                parsed = json.loads(raw_text)
                if isinstance(parsed, list):
                    return parsed
                # if not list, treat as parse failure
                logger.warning("AI returned JSON that is not a list; returning [] — raw response: %s", raw_text)
                return []
            except json.JSONDecodeError:
                logger.warning("AI JSON PARSE ERROR on attempt %d — raw response: %s", attempt, raw_text)
                # Continue to retry for transient issues
                last_exc = None
                # small backoff before retrying
                sleep = base_sleep * (2 ** (attempt - 1)) * (1 + random.random() * 0.1)
                time.sleep(min(sleep, 30.0))
                continue

        except exceptions.ResourceExhausted as e:
            last_exc = e
            logger.warning("ResourceExhausted on attempt %d: %s", attempt, e)
            server_delay = _extract_retry_delay_from_exc(e)
            if server_delay:
                sleep = server_delay + random.uniform(0, server_delay * 0.1)
            else:
                sleep = base_sleep * (2 ** (attempt - 1)) * (1 + random.random() * 0.1)
            time.sleep(min(sleep, 60.0))
            continue
        except Exception as e:
            logger.exception("Unexpected error calling generate_content: %s", e)
            last_exc = e
            # For unknown errors, break and return [] (or re-raise if you prefer)
            break

    # If attempts exhausted, try fallback model (if configured)
    if FALLBACK_MODEL and (last_exc is None or isinstance(last_exc, exceptions.ResourceExhausted)):
        try:
            logger.info("Trying fallback model: %s", FALLBACK_MODEL)
            model = genai.GenerativeModel(FALLBACK_MODEL)
            response = model.generate_content(request_payload["prompt"])
            raw_text = _try_extract_text_from_response(response).strip()
            raw_text = raw_text.replace("```json", "").replace("```", "").strip()
            try:
                parsed = json.loads(raw_text)
                if isinstance(parsed, list):
                    return parsed
            except Exception:
                logger.warning("Fallback model JSON parse failed — raw response: %s", raw_text)
        except exceptions.ResourceExhausted as e:
            logger.error("Fallback model also exhausted quota: %s", e)
        except Exception as e:
            logger.exception("Fallback model unexpected error: %s", e)

    # final fallback: return empty list (caller should handle this gracefully)
    logger.error("AI suggestions generation failed after retries. Last exception: %s", last_exc)
    return []
