from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.job import Job
from app.schemas.job import JobCreate, JobResponse, JobStatusUpdate
from app.api.deps import RequireRole, get_current_user
from app.models.user import User

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/fetch", response_model=List[JobResponse])
def get_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    jobs = db.query(Job).offset(skip).limit(limit).all()
    return jobs

@router.get("/active", response_model=List[JobResponse])
def get_active_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(Job).filter(Job.status == "Active").offset(skip).limit(limit).all()

@router.get("/closed", response_model=List[JobResponse])
def get_closed_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    from datetime import datetime, timezone
    all_closed = db.query(Job).filter(Job.status.like("Closed%")).all()
    result = []
    for j in all_closed:
        try:
            if ":" in j.status:
                date_str = j.status.split(":")[1]
                closed_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            else:
                closed_date = j.postedDate.replace(tzinfo=timezone.utc)
            delta = datetime.now(timezone.utc) - closed_date
            if delta.days < 30:
                result.append(j)
        except Exception:
            result.append(j)
    return result[skip : skip + limit]

@router.get("/archived", response_model=List[JobResponse])
def get_archived_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    from datetime import datetime, timezone
    all_closed = db.query(Job).filter(Job.status.like("Closed%")).all()
    result = []
    for j in all_closed:
        try:
            if ":" in j.status:
                date_str = j.status.split(":")[1]
                closed_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            else:
                closed_date = j.postedDate.replace(tzinfo=timezone.utc)
            delta = datetime.now(timezone.utc) - closed_date
            if delta.days >= 30:
                result.append(j)
        except Exception:
            pass
    return result[skip : skip + limit]

@router.get("/departments", response_model=List[str])
def get_departments(
    db: Session = Depends(get_db)
):
    departments = db.query(Job.department).distinct().all()
    result = [d[0] for d in departments if d[0]]
    return sorted(result)

@router.post("/create", response_model=JobResponse)
def create_job(
    job: JobCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["SUPERADMIN", "ADMIN"]))
):
    db_job = Job(**job.model_dump())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    from app.services.activity_logger import log_activity
    log_activity(
        db=db,
        action_type="job_created",
        description=f"{current_user.name} ({current_user.role}) created a new job: {db_job.title} ({db_job.department})",
        user_name=current_user.name,
        user_email=current_user.email,
        job_id=db_job.id
    )
    
    return db_job

@router.post("/{job_id}/status", response_model=JobResponse)
def update_job_status(
    job_id: str,
    status_update: JobStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["SUPERADMIN", "ADMIN", "RECRUITER"]))
):
    db_job = db.query(Job).filter(Job.id == job_id).first()
    if not db_job:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found")
    
    from datetime import datetime, timezone
    
    # Enforce archiving rules: cannot reopen a job closed for 30 days or more
    if status_update.status == "Active" and db_job.status and db_job.status.startswith("Closed"):
        try:
            if ":" in db_job.status:
                date_str = db_job.status.split(":")[1]
                closed_date = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            else:
                # Fallback to postedDate if no status date is set
                closed_date = db_job.postedDate.replace(tzinfo=timezone.utc)
                
            delta = datetime.now(timezone.utc) - closed_date
            if delta.days >= 30:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=400, 
                    detail="This job has been closed for more than 30 days and is archived. It cannot be reopened."
                )
        except Exception:
            pass

    if status_update.status == "Closed":
        db_job.status = f"Closed:{datetime.now(timezone.utc).date().isoformat()}"
    else:
        db_job.status = status_update.status

    db.commit()
    db.refresh(db_job)
    
    from app.services.activity_logger import log_activity
    log_activity(
        db=db,
        action_type="job_status_updated",
        description=f"{current_user.name} ({current_user.role}) updated job '{db_job.title}' status to {status_update.status}",
        user_name=current_user.name,
        user_email=current_user.email,
        job_id=db_job.id
    )
    
    return db_job
