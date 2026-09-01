from fastapi import APIRouter
from pydantic import BaseModel

from app.ai.rag import ask_studybuddy


router = APIRouter()


class AskRequest(BaseModel):
    question: str
    course_id: int | None = None


@router.post("/ai/ask")
def ask_ai(request: AskRequest):

    if not request.question.strip():
        return {
            "answer": "Please enter a question.",
            "sources": []
        }

    return ask_studybuddy(
        request.question,
        course_id=request.course_id
    )