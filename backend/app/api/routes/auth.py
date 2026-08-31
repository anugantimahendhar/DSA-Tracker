from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from app.api.dependencies import get_current_user
from app.services.auth_service import auth_service
from app.repositories.user_repository import user_repository
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserProfileResponse,
    UpdateProfileRequest
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegisterRequest):
    return await auth_service.register(req)


@router.post("/login", response_model=AuthResponse)
async def login(req: UserLoginRequest):
    return await auth_service.login(req)


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    print("CURRENT USER FROM BACKEND:", current_user)
    return UserProfileResponse(**current_user)


@router.put("/profile", response_model=UserProfileResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    updated = await user_repository.update_profile(current_user["id"], updates)
    return UserProfileResponse(**updated)