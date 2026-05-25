import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

from app.core.database import Base
from app.core.utils import generate_uuid

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, default="Active")
    applicants = Column(Integer, default=0)
    postedDate = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    description = Column(Text, nullable=False)
    skills = Column(JSONB, default=list)

    candidates = relationship("Candidate", back_populates="job")
