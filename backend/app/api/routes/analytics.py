from typing import Dict, Any
from fastapi import APIRouter, Depends
from app.api.dependencies import get_current_user
from app.services.analytics_service import analytics_service
from app.schemas.analytics import AnalyticsOverviewResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("", response_model=AnalyticsOverviewResponse)
async def get_analytics(current_user: Dict[str, Any] = Depends(get_current_user)):
    return await analytics_service.get_overview(current_user["id"])