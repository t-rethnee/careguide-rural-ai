
from database import SessionLocal
from models import HealthcareDocument, HealthcareKnowledgeSource
from embedding_service import generate_embedding


# =====================================
# Semantic Search Configuration
# =====================================

DEFAULT_TOP_K = 5

# Initial threshold based on current test results.
MIN_SIMILARITY_SCORE = 0.55


# =====================================
# Search Approved Healthcare Documents
# =====================================

def search_relevant_documents(
    question: str,
    top_k: int = DEFAULT_TOP_K
) -> list[dict]:

    if not isinstance(question, str) or not question.strip():
        raise ValueError("Question cannot be empty.")

    if top_k < 1:
        raise ValueError("top_k must be at least 1.")

    # Step 1: Generate question embedding
    query_embedding = generate_embedding(question.strip())

    # Step 2: Connect to Neon database
    db = SessionLocal()

    try:

        # Step 3: Calculate cosine distance
        distance = HealthcareDocument.embedding.cosine_distance(
            query_embedding
        ).label("distance")

        # Step 4: Retrieve chunks only from approved sources
        results = (
            db.query(HealthcareDocument, distance)
            .join(
                HealthcareKnowledgeSource,
                HealthcareDocument.source_id
                == HealthcareKnowledgeSource.id
            )
            .filter(
                HealthcareDocument.embedding.is_not(None),
                HealthcareKnowledgeSource.status == "approved"
            )
            .order_by(distance.asc())
            .limit(top_k)
            .all()
        )

        # Step 5: Filter using similarity threshold
        retrieved_documents = []

        for document, cosine_distance in results:

            similarity_score = 1 - float(cosine_distance)

            if similarity_score < MIN_SIMILARITY_SCORE:
                continue

            retrieved_documents.append({
                "source_id": document.source_id,
                "content": document.content,
                "source_title": document.source_title,
                "source_url": document.source_url,
                "page_number": document.page_number,
                "chunk_index": document.chunk_index,
                "similarity_score": similarity_score
            })

        return retrieved_documents

    finally:
        db.close()


# =====================================
# Check Information Availability
# =====================================

def has_sufficient_information(
    results: list[dict]
) -> bool:

    if not results:
        return False

    return any(
        result["similarity_score"] >= MIN_SIMILARITY_SCORE
        for result in results
    )


# =====================================
# Display Search Results
# =====================================

def print_search_results(results: list[dict]):

    if not has_sufficient_information(results):

        print("\nNo sufficiently relevant information found.")
        print(
            "The knowledge base does not contain "
            "enough approved information for this question."
        )
        return

    print("\n========== SEMANTIC SEARCH RESULTS ==========")

    for index, result in enumerate(results, start=1):

        print(f"\nResult {index}")
        print("--------------------------------------------")

        print("Source ID:", result["source_id"])
        print("Source:", result["source_title"])
        print("Page:", result["page_number"])
        print("Chunk:", result["chunk_index"])

        print(
            "Similarity:",
            round(result["similarity_score"], 4)
        )

        print("\nContent:")
        print(result["content"])

        print("\nSource URL:")
        print(result["source_url"])

    print("\n============================================")
