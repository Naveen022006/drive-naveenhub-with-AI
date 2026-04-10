"""
Configuration module for NaveenHub Drive Assistant.
Loads environment variables and provides a centralized config class.
"""

import os
from dotenv import load_dotenv

# Load .env file from the workspace root (parent directory)
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=env_path)


class Config:
    """Application configuration loaded from environment variables."""

    # Flask
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"

    # Google OAuth 2.0
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv(
        "GOOGLE_REDIRECT_URI", "http://localhost:5000/callback"
    )

    # Google Drive API scopes
    SCOPES = [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
        "openid",
    ]

    # Frontend URL (for CORS and redirects)
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

    # Session configuration
    SESSION_COOKIE_SAMESITE = "Lax"
    SESSION_COOKIE_SECURE = os.getenv("FLASK_ENV") == "production"
    PERMANENT_SESSION_LIFETIME = 86400  # 24 hours in seconds

    # Nvidia / OpenAI Compatible API
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

    @classmethod
    def validate(cls):
        """Validate that required configuration is present."""
        missing = []
        if not cls.GOOGLE_CLIENT_ID:
            missing.append("GOOGLE_CLIENT_ID")
        if not cls.GOOGLE_CLIENT_SECRET:
            missing.append("GOOGLE_CLIENT_SECRET")
        if missing:
            raise ValueError(
                f"Missing required environment variables: {', '.join(missing)}"
            )
