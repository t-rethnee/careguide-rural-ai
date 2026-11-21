
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
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector



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

# =====================================
# Healthcare Knowledge Base Model
# =====================================

class HealthcareKnowledgeSource(Base):

    __tablename__ = "healthcare_knowledge_sources"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    source_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    original_filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    publisher: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    language: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="English"
    )

    document_type: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending"
    )

    uploaded_by: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
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

    chunks = relationship(
        "HealthcareDocument",
        back_populates="knowledge_source",
        cascade="all, delete-orphan"
    )





class HealthcareDocument(Base):

    __tablename__ = "healthcare_documents"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # Healthcare document content
    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # BGE-M3 embedding (1024 dimensions)
    embedding: Mapped[list[float] | None] = mapped_column(
        Vector(1024),
        nullable=True
    )

    # Original document information
    source_title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Link chunk to its original knowledge source
    source_id: Mapped[int | None] = mapped_column(
        ForeignKey("healthcare_knowledge_sources.id"),
        nullable=True,
        index=True
    )

    knowledge_source = relationship(
        "HealthcareKnowledgeSource",
        back_populates="chunks"
    )

    page_number: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    # Position of this chunk in the document
    chunk_index: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    # Additional document information
    document_metadata: Mapped[dict | None] = mapped_column(
        "metadata",
        JSONB,
        nullable=True
    )

    created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

# =====================================
# User Report Model
# =====================================

class UserReport(Base):

    __tablename__ = "user_reports"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    # User who submitted the report
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # Related healthcare question
    question: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Related AI response
    ai_response: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Type of reported issue
    report_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    # User's explanation of the issue
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    # Admin review status
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="pending",
        index=True
    )

    # Admin's review note
    admin_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    # Admin who reviewed the report
    reviewed_by: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"),
        nullable=True
    )

    reviewed_at = mapped_column(
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
