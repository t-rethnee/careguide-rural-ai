
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import SessionLocal
from dependencies import get_current_user
from models import User, UserReport


router = APIRouter(
    prefix="/api/reports",
    tags=["User Reports"]
)


# =====================================
# Report Request Schema
# =====================================

class ReportCreate(BaseModel):

    question: str | None = None

    ai_response: str | None = None

    report_type: str = Field(
        min_length=3,
        max_length=100
    )

    description: str = Field(
        min_length=5,
        max_length=3000
    )


# =====================================
# Submit User Report
# =====================================

@router.post(
    "/",
    status_code=status.HTTP_201_CREATED
)
def submit_report(
    report_data: ReportCreate,
    current_user: User = Depends(get_current_user)
):

    db = SessionLocal()

    try:

        new_report = UserReport(
            user_id=current_user.id,
            question=report_data.question,
            ai_response=report_data.ai_response,
            report_type=report_data.report_type,
            description=report_data.description,
            status="pending"
        )

        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report submitted successfully.",
            "report": {
                "id": new_report.id,
                "user_id": new_report.user_id,
                "report_type": new_report.report_type,
                "status": new_report.status,
                "created_at": new_report.created_at
            }
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit report."
        )

    finally:
        db.close()
