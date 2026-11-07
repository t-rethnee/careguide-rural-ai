
import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

MODEL_NAME = "gemini-3.5-flash-lite"

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/"
    f"v1beta/models/{MODEL_NAME}:generateContent"
)


def generate_healthcare_response(question: str) -> str:

    prompt = f"""
    You are CareGuide Rural AI, a healthcare information assistant
    designed for rural people in Bangladesh.

    Instructions:
    1. Answer in simple Bangla if the user asks in Bangla.
    2. Provide general healthcare information only.
    3. Do not diagnose diseases or prescribe medicines.
    4. Do not recommend medicine dosages.
    5. For serious symptoms, advise consulting a qualified
       healthcare professional.
    6. Keep answers clear and easy to understand.

    User's question:
    {question}
    """

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
            "temperature": 0.5
        }
    }

    try:
        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            json=payload,
            timeout=90
        )

        response.raise_for_status()

        data = response.json()

        return data["candidates"][0]["content"]["parts"][0]["text"]

    except requests.exceptions.Timeout:
        raise Exception("Gemini API request timed out.")

    except requests.exceptions.RequestException:
        raise Exception("Unable to connect to Gemini API.")

    except (KeyError, IndexError, TypeError):
        raise Exception("Invalid response received from Gemini API.")
