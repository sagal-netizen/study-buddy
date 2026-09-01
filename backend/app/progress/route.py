from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal

from .repository import (
    mark_chapter_complete,
    get_user_progress,
)


router = APIRouter()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# MARK CHAPTER COMPLETE
# =========================

@router.post(
    "/progress/{user_id}/{chapter_id}/complete"
)
def complete_chapter(
    user_id: int,
    chapter_id: int,
    db: Session = Depends(get_db)
):
    progress = mark_chapter_complete(
        db,
        user_id,
        chapter_id
    )

    return {
        "message": "Chapter marked as completed",
        "progress": {
            "id": progress.id,
            "user_id": progress.user_id,
            "chapter_id": progress.chapter_id,
            "completed": progress.completed
        }
    }


# =========================
# GET USER PROGRESS
# =========================

@router.get(
    "/progress/{user_id}"
)
def user_progress(
    user_id: int,
    db: Session = Depends(get_db)
):
    progress = get_user_progress(
        db,
        user_id
    )

    return [
        {
            "id": item.id,
            "user_id": item.user_id,
            "chapter_id": item.chapter_id,
            "completed": item.completed
        }
        for item in progress
    ]