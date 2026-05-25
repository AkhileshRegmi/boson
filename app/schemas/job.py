from pydantic import BaseModel, ConfigDict
from typing import List, Literal
from datetime import datetime

class JobBase(BaseModel):
    title: str
    department: str
    location: str
    type: str
    description: str
    skills: List[str] = []

class JobCreate(JobBase):
    pass

class JobResponse(JobBase):
    id: str
    status: str
    applicants: int
    postedDate: datetime

    model_config = ConfigDict(from_attributes=True)

class JobStatusUpdate(BaseModel):
    status: Literal["Active", "Closed"]
