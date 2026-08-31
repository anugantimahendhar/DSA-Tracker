from pydantic import BaseModel


class NoteSaveRequest(BaseModel):
    question_id: str
    content: str


class NoteResponse(BaseModel):
    question_id: str
    content: str
    updated_at: str