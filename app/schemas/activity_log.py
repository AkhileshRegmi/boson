from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActivityLogResponse(BaseModel):
    id: str
    timestamp: datetime
    action_type: str
    description: str
    user_name: str
    user_email: Optional[str] = None
    job_id: Optional[str] = None
    candidate_id: Optional[str] = None

    class Config:
        from_attributes = True

class PaginatedActivityLogsResponse(BaseModel):
    items: list[ActivityLogResponse]
    total: int
    page: int
    size: int
    pages: int

