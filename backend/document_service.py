
from io import BytesIO

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from database import SessionLocal
from models import HealthcareDocument, HealthcareKnowledgeSource
from embedding_service import generate_embeddings


# =====================================
# Text Chunking Configuration
# =====================================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=120,
    separators=["\n\n", "\n", ". ", " ", ""]
)


# =====================================
# Extract Text from Uploaded PDF
# =====================================

def extract_pdf_pages(pdf_bytes: bytes):

    if not pdf_bytes:
        raise ValueError("Uploaded PDF is empty.")

    reader = PdfReader(BytesIO(pdf_bytes))

    if reader.is_encrypted:
        raise ValueError("Encrypted PDF files are not supported.")

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):

        page_text = page.extract_text()

        if page_text and page_text.strip():

            pages.append({
                "page_number": page_number,
                "text": page_text.strip()
            })

    if not pages:
        raise ValueError(
            "No extractable text found in the uploaded PDF."
        )

    return pages


# =====================================
# Create Text Chunks
# =====================================

def create_document_chunks(pages):

    chunks = []
    chunk_index = 0

    for page in pages:

        page_chunks = text_splitter.split_text(
            page["text"]
        )

        for chunk in page_chunks:

            chunks.append({
                "content": chunk,
                "page_number": page["page_number"],
                "chunk_index": chunk_index
            })

            chunk_index += 1

    if not chunks:
        raise ValueError("No text chunks could be created.")

    return chunks


# =====================================
# Ingest Uploaded Healthcare PDF
# =====================================

def ingest_pdf_document(
    pdf_bytes: bytes,
    source_title: str,
    original_filename: str,
    uploaded_by: int,
    source_url: str | None = None,
    publisher: str | None = None,
    language: str = "English",
    document_type: str | None = None
):

    if not source_title or not source_title.strip():
        raise ValueError("Document title is required.")

    if not original_filename or not original_filename.strip():
        raise ValueError("Original filename is required.")

    # Step 1: Extract PDF text
    pages = extract_pdf_pages(pdf_bytes)

    # Step 2: Create chunks
    chunks = create_document_chunks(pages)

    # Step 3: Generate embeddings
    contents = [
        chunk["content"]
        for chunk in chunks
    ]

    embeddings = generate_embeddings(contents)

    if len(embeddings) != len(chunks):
        raise ValueError(
            "Embedding count does not match chunk count."
        )

    # Step 4: Save source and chunks
    db = SessionLocal()

    try:

        knowledge_source = HealthcareKnowledgeSource(
            source_title=source_title.strip(),
            original_filename=original_filename.strip(),
            source_url=source_url,
            publisher=publisher,
            language=language,
            document_type=document_type,
            status="pending",
            uploaded_by=uploaded_by
        )

        db.add(knowledge_source)

        # Generate source ID before creating chunks
        db.flush()

        documents = []

        for chunk, embedding in zip(chunks, embeddings):

            document = HealthcareDocument(
                content=chunk["content"],
                embedding=embedding,
                source_title=source_title.strip(),
                source_url=source_url,
                source_id=knowledge_source.id,
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                document_metadata={
                    "language": language,
                    "publisher": publisher,
                    "document_type": document_type,
                    "file_name": original_filename
                }
            )

            documents.append(document)

        db.add_all(documents)

        db.commit()
        db.refresh(knowledge_source)

        return {
            "source_id": knowledge_source.id,
            "source_title": knowledge_source.source_title,
            "status": knowledge_source.status,
            "total_chunks": len(documents)
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()

# =====================================
# Replace Existing Healthcare PDF
# =====================================

def replace_pdf_document(
    source_id: int,
    pdf_bytes: bytes,
    original_filename: str
):
    if not original_filename or not original_filename.strip():
        raise ValueError("Original filename is required.")

    # Step 1: Extract PDF text
    pages = extract_pdf_pages(pdf_bytes)

    # Step 2: Create chunks
    chunks = create_document_chunks(pages)

    # Step 3: Generate new embeddings
    contents = [
        chunk["content"]
        for chunk in chunks
    ]

    embeddings = generate_embeddings(contents)

    if len(embeddings) != len(chunks):
        raise ValueError(
            "Embedding count does not match chunk count."
        )

    db = SessionLocal()

    try:
        # Step 4: Find existing knowledge source
        source = (
            db.query(HealthcareKnowledgeSource)
            .filter(
                HealthcareKnowledgeSource.id == source_id
            )
            .first()
        )

        if source is None:
            raise ValueError("Healthcare document not found.")

        # Step 5: Delete only this source's old chunks
        (
            db.query(HealthcareDocument)
            .filter(
                HealthcareDocument.source_id == source_id
            )
            .delete(synchronize_session=False)
        )

        # Step 6: Update source information
        source.original_filename = original_filename.strip()

        # New content must be reviewed again
        source.status = "pending"

        # Step 7: Insert new chunks and embeddings
        documents = []

        for chunk, embedding in zip(chunks, embeddings):

            document = HealthcareDocument(
                content=chunk["content"],
                embedding=embedding,
                source_title=source.source_title,
                source_url=source.source_url,
                source_id=source.id,
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                document_metadata={
                    "language": source.language,
                    "publisher": source.publisher,
                    "document_type": source.document_type,
                    "file_name": original_filename.strip()
                }
            )

            documents.append(document)

        db.add_all(documents)

        # Commit old chunk deletion and new chunk insertion together
        db.commit()
        db.refresh(source)

        return {
            "source_id": source.id,
            "source_title": source.source_title,
            "original_filename": source.original_filename,
            "status": source.status,
            "total_chunks": len(documents)
        }

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
