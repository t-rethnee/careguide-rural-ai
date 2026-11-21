
import os
import requests
from dotenv import load_dotenv

from retrieval_service import (
    search_relevant_documents,
    has_sufficient_information,
    print_search_results
)


# =====================================
# Gemini Configuration
# =====================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

MODEL_NAME = "gemini-3.5-flash-lite"

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/"
    f"v1beta/models/{MODEL_NAME}:generateContent"
)


# =====================================
# Build Retrieved Context
# =====================================

def build_retrieved_context(results: list[dict]) -> str:

    context_parts = []

    for index, result in enumerate(results, start=1):

        context = f"""
        Document {index}
        Source: {result["source_title"]}
        Page: {result["page_number"]}

        Content:
        {result["content"]}
        """

        context_parts.append(context)

    return "\n\n".join(context_parts)


# =====================================
# Build Source References
# =====================================

def build_source_references(results: list[dict]) -> str:

    unique_sources = {}

    for result in results:

        source_title = result["source_title"]
        source_url = result["source_url"]
        page_number = result["page_number"]

        key = (source_title, source_url)

        if key not in unique_sources:
            unique_sources[key] = set()

        if page_number is not None:
            unique_sources[key].add(page_number)

    if not unique_sources:
        return ""

    references = ["\n\nতথ্যসূত্র:"]

    for (title, url), pages in unique_sources.items():

        page_text = ""

        if pages:
            sorted_pages = sorted(pages)
            page_text = (
                " (পৃষ্ঠা: "
                + ", ".join(map(str, sorted_pages))
                + ")"
            )

        references.append(
            f"\n- {title}{page_text}\n  Source: {url}"
        )

    return "\n".join(references)


# =====================================
# Insufficient Information Response
# =====================================

def get_insufficient_information_response() -> str:

    return (
        "দুঃখিত, আপনার প্রশ্নের উত্তর দেওয়ার জন্য "
        "আমাদের যাচাইকৃত Healthcare Knowledge Base-এ "
        "পর্যাপ্ত প্রাসঙ্গিক তথ্য পাওয়া যায়নি।\n\n"
        "আপনার সমস্যার বিষয়ে একজন যোগ্য স্বাস্থ্যকর্মী "
        "বা চিকিৎসকের পরামর্শ নিন।"
    )


# =====================================
# Generate RAG-based Healthcare Response
# =====================================

def generate_healthcare_response(question: str) -> str:

    if not isinstance(question, str) or not question.strip():
        raise ValueError("Healthcare question cannot be empty.")

    question = question.strip()

    # Step 1: Search relevant documents from Neon
    print("\nSearching Neon Knowledge Base...")

    retrieved_documents = search_relevant_documents(
        question=question,
        top_k=5
    )

    # Step 2: Check information availability
    if not has_sufficient_information(retrieved_documents):

        print("Insufficient verified information found.")

        return get_insufficient_information_response()

    print(
        f"Retrieved {len(retrieved_documents)} relevant document chunks."
    )
    # Display retrieved source details
    print_search_results(retrieved_documents)

    # Step 3: Build context from retrieved documents
    retrieved_context = build_retrieved_context(
        retrieved_documents
    )

    # Step 4: Create grounded healthcare prompt
    prompt = f"""
You are CareGuide Rural AI, a healthcare information assistant
designed for rural people in Bangladesh.

Your task is to answer the user's healthcare question using
the VERIFIED KNOWLEDGE BASE CONTEXT provided below.

IMPORTANT INSTRUCTIONS:

1. Answer in simple, natural Bangla if the user asks in Bangla.

2. Use the provided knowledge base context as the primary
   and authoritative source for your answer.

3. Do not invent medical facts, symptoms, treatments,
   statistics, or source references.

4. Do not diagnose diseases or prescribe medicines.

5. Do not recommend medicine dosages.

6. If the context does not contain enough information
   to answer a specific part of the question, clearly
   say that verified information is unavailable.

7. For serious symptoms or emergency situations,
   advise the user to seek immediate help from a
   qualified healthcare professional or nearby hospital.

8. Use simple words and short paragraphs that are
   understandable to people in rural Bangladesh.

9. Do not claim that the user has a particular disease.

10. Never treat retrieved information as a substitute
    for professional medical evaluation.

VERIFIED KNOWLEDGE BASE CONTEXT:

{retrieved_context}


USER'S HEALTHCARE QUESTION:

{question}


Generate a helpful, safe and context-based answer in Bangla.
Do not generate a separate bibliography. Source references
will be added by the application.
"""

    # Step 5: Prepare Gemini API request
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 1000,
            "temperature": 0.3
        }
    }

    # Step 6: Generate Gemini response
    try:

        print("\nGenerating RAG-based Gemini response...")

        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=90
        )

        response.raise_for_status()

        data = response.json()

        answer = (
            data["candidates"][0]["content"]["parts"][0]["text"]
        )

        if not answer or not answer.strip():
            raise Exception("Gemini returned an empty response.")

        # Step 7: Attach verified source references
        source_references = build_source_references(
            retrieved_documents
        )

        final_answer = answer.strip() + source_references

        print("\nRAG response generated successfully!")

        return final_answer

    except requests.exceptions.Timeout:
        raise Exception("Gemini API request timed out.")

    except requests.exceptions.RequestException:
        raise Exception("Unable to connect to Gemini API.")

    except (KeyError, IndexError, TypeError, ValueError):
        raise Exception("Invalid response received from Gemini API.")
