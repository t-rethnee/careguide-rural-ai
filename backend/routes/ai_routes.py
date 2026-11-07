from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field

from ai_service import generate_healthcare_response
from dependencies import get_current_user
from models import User

router = APIRouter(
    prefix="/api/assistant",
    tags=["Healthcare Assistant"]
)


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    data: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        answer = generate_healthcare_response(data.question)

        return {
            "answer": answer
        }

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Unable to generate a response. Please try again later."
        )