from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime
from app.core.database import Base
from app.core.utils import generate_uuid

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    action_type = Column(String, nullable=False, index=True)  # e.g., "job_created", "job_status_updated", "candidate_applied", "candidate_stage_updated", "member_role_updated"
    description = Column(String, nullable=False)
    user_name = Column(String, nullable=False)  # Name of recruiter or "System (Applicant)"
    user_email = Column(String, nullable=True)  # Email of recruiter or None
    job_id = Column(String, nullable=True, index=True)
    candidate_id = Column(String, nullable=True)
