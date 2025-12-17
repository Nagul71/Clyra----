from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# NOTE: this file is compatible with pydantic v1 and v2.
# For v2 we use `model_config` to set populate_by_name.

class Step(BaseModel):
    op: str

    # rename
    from_col: Optional[str] = None   # ← ADD THIS
    to: Optional[str] = None

    # alias 'from' → 'from_'
    from_: Optional[str] = Field(None, alias="from")

    column: Optional[str] = None
    strategy: Optional[str] = None
    value: Optional[Any] = None
    from_value: Optional[Any] = None
    to_value: Optional[Any] = None
    byColumns: Optional[List[str]] = None

    model_config = {
        "populate_by_name": True,
        "extra": "allow",
    }


class PreviewRequest(BaseModel):
    dataset_url: str
    step: Step


class PipelineRequest(BaseModel):
    dataset_id: str
    dataset_url: str
    dataset_path: str  # 🔥 required for overwrite
    pipeline: List[Step]
    project_id: str
    user_id: str
