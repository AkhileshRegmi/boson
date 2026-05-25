from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.activity_log import ActivityLog
from app.schemas.activity_log import ActivityLogResponse, PaginatedActivityLogsResponse
from app.api.deps import RequireRole, get_current_user
from app.models.user import User

router = APIRouter(prefix="/activity-logs", tags=["activity-logs"])

@router.get("/fetch", response_model=PaginatedActivityLogsResponse)
def get_activity_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    action_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(RequireRole(["SUPERADMIN", "ADMIN"]))
):
    """
    Fetch activity logs sorted by timestamp descending, paginated and filtered.
    Accessible only to SUPERADMIN and ADMIN users.
    """
    query = db.query(ActivityLog)
    
    if action_type and action_type != "all":
        query = query.filter(ActivityLog.action_type == action_type)
        
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (ActivityLog.description.ilike(search_filter)) |
            (ActivityLog.user_name.ilike(search_filter)) |
            (ActivityLog.user_email.ilike(search_filter))
        )
        
    total = query.count()
    offset = (page - 1) * size
    logs = query.order_by(ActivityLog.timestamp.desc()).offset(offset).limit(size).all()
    pages = (total + size - 1) // size if total > 0 else 0
    
    return {
        "items": logs,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }

