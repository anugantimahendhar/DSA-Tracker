from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from app.api.dependencies import get_current_admin, get_current_user
from app.schemas.ai import AIQuestionGenerateRequest, AIQuestionDraft, LeaderboardResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/generate-question", response_model=AIQuestionDraft)
async def generate_question(req: AIQuestionGenerateRequest, admin: Dict[str, Any] = Depends(get_current_admin)):
    return await ai_service.generate_question(req.question)

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def leaderboard(limit: int = Query(50, ge=1, le=100), current_user: Dict[str, Any] = Depends(get_current_user)):
    return await ai_service.leaderboard(current_user_id=current_user["id"], limit=limit)
