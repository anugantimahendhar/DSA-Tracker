from typing import Dict, Any
from app.core.exceptions import UnauthorizedException, BadRequestException
from app.repositories.user_repository import user_repository
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserProfileResponse,
    SessionData
)


class AuthService:
    def __init__(self):
        self.repo = user_repository

    async def register(self, req: UserRegisterRequest) -> AuthResponse:
        existing = await self.repo.get_by_email(req.email)
        if existing:
            raise BadRequestException("An account with this email already exists.")

        profile = await self.repo.create_user(
            email=req.email,
            password=req.password,
            role="user",
            default_language=req.default_language or "python"
        )
        
        # Log in to get session
        auth_data = await self.repo.authenticate(req.email, req.password)
        token = auth_data["session"]["access_token"] if auth_data and auth_data.get("session") else "mock-token"

        return AuthResponse(
            user=UserProfileResponse(**profile),
            session=SessionData(access_token=token)
        )

    async def login(self, req: UserLoginRequest) -> AuthResponse:
        auth_data = await self.repo.authenticate(req.email, req.password)
        if not auth_data or not auth_data.get("user"):
            raise UnauthorizedException("Invalid email or password.")

        return AuthResponse(
            user=UserProfileResponse(**auth_data["user"]),
            session=SessionData(access_token=auth_data["session"]["access_token"])
        )


auth_service = AuthService()