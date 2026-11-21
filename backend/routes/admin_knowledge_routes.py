
import logging

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status
)

from dependencies import get_current_admin
from models import User
from document_service import (
    ingest_pdf_document,
    replace_pdf_document
)
from database import SessionLocal
from models import User, HealthcareKnowledgeSource
from pydantic import BaseModel



logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/admin/knowledge-base",
    tags=["Admin Knowledge Base"]
)
class KnowledgeSourceUpdate(BaseModel):
    source_title: str | None = None
    source_url: str | None = None
    publisher: str | None = None
    language: str | None = None
    document_type: str | None = None

MAX_FILE_SIZE = 10 * 1024 * 1024


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_healthcare_document(
    file: UploadFile = File(...),
    source_title: str = Form(...),
    source_url: str | None = Form(None),
    publisher: str | None = Form(None),
    language: str = Form("English"),
    document_type: str | None = Form(None),
    current_admin: User = Depends(get_current_admin)
):
    # Validate filename
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    # Read uploaded file
    pdf_bytes = await file.read(MAX_FILE_SIZE + 1)

    if not pdf_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded PDF is empty."
        )

    if len(pdf_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="PDF file size must not exceed 10 MB."
        )

    # Verify PDF file signature
    if not pdf_bytes.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid PDF file."
        )

    try:
        result = ingest_pdf_document(
            pdf_bytes=pdf_bytes,
            source_title=source_title,
            original_filename=file.filename,
            uploaded_by=current_admin.id,
            source_url=source_url,
            publisher=publisher,
            language=language,
            document_type=document_type
        )

        return {
            "message": (
                "Healthcare document uploaded successfully. "
                "Waiting for admin approval."
            ),
            "document": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except Exception:
        logger.exception("Healthcare document upload failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document processing failed. Please try again."
        )

    finally:
        await file.close()


@router.patch("/{source_id}/approve")
def approve_healthcare_document(
    source_id: int,
    current_admin: User = Depends(get_current_admin)
):
    db = SessionLocal()

    try:
        source = (
            db.query(HealthcareKnowledgeSource)
            .filter(
                HealthcareKnowledgeSource.id == source_id
            )
            .first()
        )

        if source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare document not found."
            )

        if source.status == "approved":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document is already approved."
            )

        source.status = "approved"

        db.commit()
        db.refresh(source)

        return {
            "message": "Healthcare document approved successfully.",
            "source_id": source.id,
            "source_title": source.source_title,
            "status": source.status
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        logger.exception("Document approval failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document approval failed."
        )

    finally:
        db.close()

@router.get("/")
def get_healthcare_documents(
    current_admin: User = Depends(get_current_admin)
):
    db = SessionLocal()

    try:
        sources = (
            db.query(HealthcareKnowledgeSource)
            .order_by(
                HealthcareKnowledgeSource.created_at.desc()
            )
            .all()
        )

        documents = []

        for source in sources:
            documents.append({
                "source_id": source.id,
                "source_title": source.source_title,
                "original_filename": source.original_filename,
                "source_url": source.source_url,
                "publisher": source.publisher,
                "language": source.language,
                "document_type": source.document_type,
                "status": source.status,
                "uploaded_by": source.uploaded_by,
                "total_chunks": len(source.chunks),
                "created_at": source.created_at,
                "updated_at": source.updated_at
            })

        return {
            "total_documents": len(documents),
            "documents": documents
        }

    except Exception:
        logger.exception("Failed to retrieve healthcare documents.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not retrieve healthcare documents."
        )

    finally:
        db.close()


@router.patch("/{source_id}")
def update_healthcare_document(
    source_id: int,
    update_data: KnowledgeSourceUpdate,
    current_admin: User = Depends(get_current_admin)
):
    db = SessionLocal()

    try:
        source = (
            db.query(HealthcareKnowledgeSource)
            .filter(
                HealthcareKnowledgeSource.id == source_id
            )
            .first()
        )

        if source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare document not found."
            )

        updates = update_data.model_dump(exclude_unset=True)

        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No update information provided."
            )

        if (
            "source_title" in updates
            and (
                updates["source_title"] is None
                or not updates["source_title"].strip()
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document title cannot be empty."
            )

        if (
            "language" in updates
            and (
                updates["language"] is None
                or not updates["language"].strip()
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document language cannot be empty."
            )

        for field, value in updates.items():
            if field in ("source_title", "language") and value is not None:
                value = value.strip()

            setattr(source, field, value)

        db.commit()
        db.refresh(source)

        return {
            "message": "Healthcare document updated successfully.",
            "source_id": source.id,
            "source_title": source.source_title,
            "publisher": source.publisher,
            "language": source.language,
            "document_type": source.document_type,
            "status": source.status
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        logger.exception("Document update failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document update failed."
        )

    finally:
        db.close()

@router.delete("/{source_id}")
def delete_healthcare_document(
    source_id: int,
    current_admin: User = Depends(get_current_admin)
):
    db = SessionLocal()

    try:
        source = (
            db.query(HealthcareKnowledgeSource)
            .filter(
                HealthcareKnowledgeSource.id == source_id
            )
            .first()
        )

        if source is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Healthcare document not found."
            )

        source_title = source.source_title
        source_id_value = source.id

        # Delete source and its associated chunks
        db.delete(source)
        db.commit()

        return {
            "message": "Healthcare document deleted successfully.",
            "source_id": source_id_value,
            "source_title": source_title
        }

    except HTTPException:
        raise

    except Exception:
        db.rollback()
        logger.exception("Document deletion failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document deletion failed."
        )

    finally:
        db.close()

@router.put("/{source_id}/replace")
async def replace_healthcare_document(
    source_id: int,
    file: UploadFile = File(...),
    current_admin: User = Depends(get_current_admin)
):
    try:
        # Validate filename
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are supported."
            )

        # Read uploaded PDF
        pdf_bytes = await file.read(MAX_FILE_SIZE + 1)

        if not pdf_bytes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded PDF is empty."
            )

        if len(pdf_bytes) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="PDF file size must not exceed 10 MB."
            )

        if not pdf_bytes.startswith(b"%PDF-"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file."
            )

        result = replace_pdf_document(
            source_id=source_id,
            pdf_bytes=pdf_bytes,
            original_filename=file.filename
        )

        return {
            "message": (
                "Healthcare document replaced successfully. "
                "Waiting for admin approval."
            ),
            "document": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )

    except HTTPException:
        raise

    except Exception:
        logger.exception("PDF replacement failed.")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Document replacement failed."
        )

    finally:
        await file.close()
