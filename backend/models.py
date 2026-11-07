
from sqlalchemy import (
    String,
    Integer,
    DateTime,
    Float,
    Boolean,
    Text,
    ForeignKey,
    UniqueConstraint,
    func
)
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


# =====================================
# User Model
# =====================================

class User(Base):

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="user",
        nullable=False
    )

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =====================================
# Healthcare Facility Model
# =====================================

class HealthcareFacility(Base):

    __tablename__ = "healthcare_facilities"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    dghs_id: Mapped[int | None] = mapped_column(
        Integer,
        unique=True,
        nullable=True
    )
     # DGHS Registry Facility Code
    facility_code: Mapped[str | None] = mapped_column(
        String(50),
        unique=True,
        nullable=True
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True
    )

    name_bangla: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    facility_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    agency: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    district: Mapped[str] = mapped_column(
        String(100),
        default="Dhaka",
        nullable=False
    )

    upazila: Mapped[str] = mapped_column(
        String(100),
        default="Savar",
        nullable=False,
        index=True
    )

    area_name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True
    )

    address: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    contact_number: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    email: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    latitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    longitude: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    source_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    is_searchable: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )

    verification_date = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )


# =====================================
# Facility Services Model
# =====================================

class FacilityService(Base):

    __tablename__ = "facility_services"

    __table_args__ = (
        UniqueConstraint(
            "facility_id",
            "service_name",
            name="uq_facility_service"
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    facility_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "healthcare_facilities.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    service_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    service_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# =====================================
# Emergency Contacts Model
# =====================================

class EmergencyContact(Base):

    __tablename__ = "emergency_contacts"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    facility_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "healthcare_facilities.id",
            ondelete="CASCADE"
        ),
        nullable=False,
        index=True
    )

    contact_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True
    )

    contact_number: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    contact_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    source_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    verification_date = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )
