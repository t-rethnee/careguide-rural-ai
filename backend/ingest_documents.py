
from pathlib import Path

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from database import SessionLocal
from models import HealthcareDocument
from embedding_service import generate_embeddings


# =====================================
# Document Configuration
# =====================================

BASE_DIR = Path(__file__).resolve().parent

PDF_PATH = (
    BASE_DIR
    / "knowledge_base"
    / "diarrhoeal_disease.pdf"
)

SOURCE_TITLE = "WHO - Diarrhoeal disease"
SOURCE_URL = (
    "https://www.who.int/news-room/fact-sheets/detail/diarrhoeal-disease"
)


# =====================================
# Text Chunking Configuration
# =====================================

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=120,
    separators=["\n\n", "\n", ". ", " ", ""]
)


# =====================================
# Extract Text from PDF
# =====================================

def extract_pdf_pages():

    if not PDF_PATH.exists():
        raise FileNotFoundError(
            f"PDF file not found: {PDF_PATH}"
        )

    print("Reading PDF:", PDF_PATH.name)

    reader = PdfReader(str(PDF_PATH))

    pages = []

    for page_number, page in enumerate(reader.pages, start=1):

        page_text = page.extract_text()

        if page_text and page_text.strip():
            pages.append({
                "page_number": page_number,
                "text": page_text.strip()
            })

    print("Total PDF pages:", len(reader.pages))
    print("Pages with extractable text:", len(pages))

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

    print("Total chunks created:", len(chunks))

    return chunks


# =====================================
# Save Chunks and Embeddings to Neon
# =====================================

def save_chunks_to_database(chunks):

    if not chunks:
        print("No text chunks found.")
        return

    print("\nGenerating BGE-M3 embeddings...")

    contents = [
        chunk["content"]
        for chunk in chunks
    ]

    embeddings = generate_embeddings(contents)

    print("Embeddings generated:", len(embeddings))

    db = SessionLocal()

    try:

        documents = []

        for chunk, embedding in zip(chunks, embeddings):

            document = HealthcareDocument(
                content=chunk["content"],
                embedding=embedding,
                source_title=SOURCE_TITLE,
                source_url=SOURCE_URL,
                page_number=chunk["page_number"],
                chunk_index=chunk["chunk_index"],
                document_metadata={
                    "language": "English",
                    "publisher": "World Health Organization",
                    "document_type": "Fact Sheet",
                    "file_name": PDF_PATH.name
                }
            )

            documents.append(document)

        # Replace previous chunks from this exact source
        db.query(HealthcareDocument).filter(
            HealthcareDocument.source_title == SOURCE_TITLE,
            HealthcareDocument.source_url == SOURCE_URL
        ).delete(synchronize_session=False)

        db.add_all(documents)

        db.commit()

        print("\nSuccessfully saved documents to Neon!")
        print("Total records inserted:", len(documents))

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


# =====================================
# Main Function
# =====================================

def main():

    print("===================================")
    print("CareGuide RAG - Document Ingestion")
    print("===================================\n")

    pages = extract_pdf_pages()

    chunks = create_document_chunks(pages)

    save_chunks_to_database(chunks)

    print("\nDocument ingestion completed!")


if __name__ == "__main__":
    main()
