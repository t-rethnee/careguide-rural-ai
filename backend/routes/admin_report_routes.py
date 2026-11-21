
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_admin
from models import User, UserReport


router = APIRouter(
    prefix="/api/admin/reports",
    tags=["Admin Report Management"]
)


# =====================================
# Update Report Schema
# =====================================

class ReportReviewUpdate(BaseModel):

    status: str = Field(
        min_length=3,
        max_length=20
    )

    admin_note: str | None = Field(
        default=None,
        max_length=3000
    )


# =====================================
# Get All User Reports
# =====================================

@router.get("/")
def get_all_reports(
    current_admin: User = Depends(get_current_admin)
):

    db = SessionLocal()

    try:
        reports = (
            db.query(UserReport)
            .order_by(UserReport.created_at.desc())
            .all()
        )

        return {
            "total_reports": len(reports),
            "reports": [
                {
                    "id": report.id,
                    "user_id": report.user_id,
                    "question": report.question,
                    "report_type": report.report_type,
                    "description": report.description,
                    "status": report.status,
                    "created_at": report.created_at
                }
                for report in reports
            ]
        }

    finally:
        db.close()


# =====================================
# Get Single Report Details
# =====================================

@router.get("/{report_id}")
def get_report_details(
    report_id: int,
    current_admin: User = Depends(get_current_admin)
):

    db = SessionLocal()

    try:
        report = db.query(UserReport).filter(
            UserReport.id == report_id
        ).first()

        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found."
            )

        return {
            "id": report.id,
            "user_id": report.user_id,
            "question": report.question,
            "ai_response": report.ai_response,
            "report_type": report.report_type,
            "description": report.description,
            "status": report.status,
            "admin_note": report.admin_note,
            "reviewed_by": report.reviewed_by,
            "reviewed_at": report.reviewed_at,
            "created_at": report.created_at
        }

    finally:
        db.close()


# =====================================
# Update Report Review
# =====================================

@router.patch("/{report_id}")
def update_report_review(
    report_id: int,
    review_data: ReportReviewUpdate,
    current_admin: User = Depends(get_current_admin)
):

    allowed_statuses = [
        "pending",
        "reviewed",
        "resolved"
    ]

    if review_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Use pending, reviewed, or resolved."
        )

    db = SessionLocal()

    try:
        report = db.query(UserReport).filter(
            UserReport.id == report_id
        ).first()

        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Report not found."
            )

        report.status = review_data.status
        if "admin_note" in review_data.model_fields_set:
            report.admin_note = review_data.admin_note
        report.reviewed_by = current_admin.id
        report.reviewed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(report)

        return {
            "message": "Report review updated successfully.",
            "id": report.id,
            "status": report.status,
            "admin_note": report.admin_note,
            "reviewed_by": report.reviewed_by,
            "reviewed_at": report.reviewed_at
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
