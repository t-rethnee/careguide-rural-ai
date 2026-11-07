
from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    UploadFile,
    File
)
from fastapi.responses import Response
from pydantic import BaseModel, Field

from ai_service import generate_healthcare_response
from voice_service import transcribe_audio, generate_speech

from dependencies import get_current_user
from models import User


router = APIRouter(
    prefix="/api/assistant",
    tags=["Healthcare Assistant"]
)


# =====================================
# Request / Response Models
# =====================================

class ChatRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=2000
    )


class ChatResponse(BaseModel):
    answer: str


class TranscriptResponse(BaseModel):
    transcript: str


class SpeechRequest(BaseModel):
    text: str = Field(
        min_length=1,
        max_length=5000
    )


# =====================================
# Text Chat Endpoint
# =====================================

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    data: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        answer = generate_healthcare_response(
            data.question
        )

        return {
            "answer": answer
        }

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to generate a response. Please try again later."
        )


# =====================================
# Speech-to-Text Endpoint
# =====================================

@router.post(
    "/transcribe",
    response_model=TranscriptResponse
)
async def transcribe_voice(
    audio: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    try:
        audio_bytes = await audio.read()

        if not audio_bytes:
            raise HTTPException(
                status_code=400,
                detail="Audio file is empty."
            )

        transcript = transcribe_audio(
            audio_bytes,
            audio.content_type or "audio/webm"
        )

        return {
            "transcript": transcript
        }

    except HTTPException:
        raise

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to transcribe audio. Please try again."
        )

    finally:
        await audio.close()


# =====================================
# Text-to-Speech Endpoint
# =====================================

@router.post("/speech")
def generate_voice_response(
    data: SpeechRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        audio_bytes, mime_type = generate_speech(
            data.text
        )

        return Response(
            content=audio_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition":
                    'inline; filename="careguide-response.wav"'
            }
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to generate speech. Please try again."
        )
