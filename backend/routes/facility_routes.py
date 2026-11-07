
from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
    HTTPException,
    status
)
from sqlalchemy.orm import Session

from database import get_db
from models import HealthcareFacility, FacilityService
from schemas import FacilityResponse


router = APIRouter(
    prefix="/api/facilities",
    tags=["Healthcare Facilities"]
)


# Location-based and service-based facility search
@router.get("/search", response_model=list[FacilityResponse])
def search_facilities(
    location: Optional[str] = Query(None),
    service: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(HealthcareFacility).filter(
        HealthcareFacility.is_searchable == True
    )

    # Location-based search
    if location:
        search_term = f"%{location.strip()}%"

        query = query.filter(
            (HealthcareFacility.area_name.ilike(search_term)) |
            (HealthcareFacility.upazila.ilike(search_term)) |
            (HealthcareFacility.district.ilike(search_term)) |
            (HealthcareFacility.name.ilike(search_term)) |
            (HealthcareFacility.name_bangla.ilike(search_term))
        )

    # Service-based search
    if service:
        search_term = f"%{service.strip()}%"

        query = query.join(
            FacilityService,
            HealthcareFacility.id == FacilityService.facility_id
        ).filter(
            (FacilityService.service_name.ilike(search_term)) |
            (FacilityService.service_category.ilike(search_term))
        )

    facilities = query.distinct().order_by(
        HealthcareFacility.name
    ).all()

    return facilities


# Individual facility details
@router.get(
    "/{facility_id}",
    response_model=FacilityResponse
)
def get_facility_details(
    facility_id: int,
    db: Session = Depends(get_db)
):
    facility = db.query(HealthcareFacility).filter(
        HealthcareFacility.id == facility_id,
        HealthcareFacility.is_searchable == True
    ).first()

    if not facility:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Healthcare facility not found"
        )

    return facility
