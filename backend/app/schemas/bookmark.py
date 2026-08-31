from pydantic import BaseModel


class BookmarkToggleResponse(BaseModel):
    question_id: str
    is_bookmarked: bool