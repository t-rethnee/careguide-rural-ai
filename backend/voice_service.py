
import os
import base64
import tempfile

from dotenv import load_dotenv
from google import genai


# =====================================
# Load Environment Variables
# =====================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing from environment variables."
    )


# =====================================
# Gemini Configuration
# =====================================

client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options={
        "api_version": "v1beta"
    }
)

STT_MODEL = "gemini-3.5-transcribe"
TTS_MODEL = "gemini-3.8-flash-tts"


# =====================================
# Speech-to-Text (STT)
# =====================================

def transcribe_audio(audio_bytes: bytes, mime_type: str) -> str:
    """
    Convert recorded speech into text using Gemini STT.
    """

    if not audio_bytes:
        raise ValueError("Audio file is empty.")

    temp_path = None
    uploaded_file = None

    try:
        # Determine temporary file extension
        suffix = ".webm"

        if "wav" in mime_type:
            suffix = ".wav"
        elif "mp3" in mime_type or "mpeg" in mime_type:
            suffix = ".mp3"
        elif "mp4" in mime_type:
            suffix = ".mp4"

        # Save uploaded audio temporarily
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix
        ) as temp_file:

            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        # Upload audio to Gemini
        uploaded_file = client.files.upload(
            file=temp_path
        )

        # Transcribe audio
        interaction = client.interactions.create(
            model=STT_MODEL,
            input=[
                {
                    "type": "audio",
                    "uri": uploaded_file.uri,
                    "mime_type": uploaded_file.mime_type,
                }
            ],
        )

        transcript = (
            interaction.output_text or ""
        ).strip()

        if not transcript:
            raise ValueError("No speech was detected.")

        return transcript

    finally:
        # Remove temporary local file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        # Delete uploaded Gemini file when possible
        if uploaded_file:
            try:
                client.files.delete(
                    name=uploaded_file.name
                )
            except Exception:
                pass


# =====================================
# Text-to-Speech (TTS)
# =====================================


def generate_speech(text: str) -> tuple[bytes, str]:
    """
    Convert text into audio using Gemini 3.8 Flash TTS.
    """

    if not text or not text.strip():
        raise ValueError("Text cannot be empty.")

    interaction = client.interactions.create(
        model=TTS_MODEL,

        input=[
            {
                "type": "user_input",
                "content": [
                    {
                        "type": "text",
                        "text": text.strip(),
                    }
                ],
            }
        ],

        response_format={
            "type": "audio"
        },

        generation_config={
            "speech_config": [
                {
                    "voice": "Kore"
                }
            ]
        },
    )

    audio_output = interaction.output_audio

    if not audio_output or not audio_output.data:
        raise ValueError("Audio generation failed.")

    audio_bytes = base64.b64decode(
        audio_output.data
    )

    mime_type = (
        getattr(audio_output, "mime_type", None)
        or "audio/wav"
    )

    return audio_bytes, mime_type
