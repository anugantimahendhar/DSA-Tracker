from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    default_language: Optional[str] = "python"


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserProfileResponse(BaseModel):
    id: str
    email: str
    role: str
    default_language: str
    created_at: str
    updated_at: str


class SessionData(BaseModel):
    access_token: str


class AuthResponse(BaseModel):
    user: UserProfileResponse
    session: SessionData


class UpdateProfileRequest(BaseModel):
    default_language: Optional[str] = None