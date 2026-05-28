from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import BaseModelDB

class ActivityLog(BaseModelDB):
    __tablename__ = "activity_logs"
    timestamp = Column(DateTime, default=datetime.now, index=True)
    action_type = Column(String, nullable=False, index=True)  # e.g., "job_created", "job_status_updated", "candidate_applied", "candidate_stage_updated", "member_role_updated"
    description = Column(String, nullable=False)
    user_name = Column(String, nullable=False)  # Name of recruiter or "System (Applicant)"
    user_email = Column(String, nullable=True)  # Email of recruiter or None
    job_id = Column(String, nullable=True, index=True)
    candidate_id = Column(String, nullable=True)
