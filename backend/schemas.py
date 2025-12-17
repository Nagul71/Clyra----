from pydantic import BaseModel
from typing import List, Dict, Any

class Step(BaseModel):
    op: str
    column: str | None = None
    from_value: str | None = None
    to_value: str | None = None
    strategy: str | None = None
    value: Any | None = None
    byColumns: List[str] | None = None
    part: str | None = None

class PreviewRequest(BaseModel):
    dataset_url: str
    step: Step

class PreviewResponse(BaseModel):
    preview_rows: List[Dict[str, Any]]


class ApplyPipelineRequest(BaseModel):
    dataset_url: str
    pipeline: List[Step]
    project_id: str
    user_id: str

class ApplyPipelineResponse(BaseModel):
    processed_url: str
