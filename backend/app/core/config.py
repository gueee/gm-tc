"""
Application configuration settings.
"""
from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "GM-TC CMS"
    DEBUG: bool = False
    API_PREFIX: str = "/api/v1"

    # Database - use gmtc_crm.db as specified in BUILD_GUIDE
    DATABASE_URL: str = "sqlite:///./gmtc_crm.db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://gm-tc.tech",
        "https://www.gm-tc.tech",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


