"""
Google OAuth 2.0 authentication service.
Handles authorization URL generation, code exchange, and token refresh.
"""

from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import json

from config import Config


def _build_client_config():
    """Build the OAuth client configuration dictionary from env vars."""
    return {
        "web": {
            "client_id": Config.GOOGLE_CLIENT_ID,
            "client_secret": Config.GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": [Config.GOOGLE_REDIRECT_URI],
        }
    }


def get_auth_url():
    """
    Generate the Google OAuth consent screen URL.
    Returns: (authorization_url, state) tuple
    """
    flow = Flow.from_client_config(
        _build_client_config(),
        scopes=Config.SCOPES,
        redirect_uri=Config.GOOGLE_REDIRECT_URI,
    )

    authorization_url, state = flow.authorization_url(
        access_type="offline",       # Get a refresh token
        include_granted_scopes="true",
        prompt="consent",            # Always show consent (ensures refresh token)
    )

    return authorization_url, state


def exchange_code(code):
    """
    Exchange the authorization code for OAuth credentials.
    Args:
        code: The authorization code from Google's callback.
    Returns:
        google.oauth2.credentials.Credentials object
    """
    flow = Flow.from_client_config(
        _build_client_config(),
        scopes=Config.SCOPES,
        redirect_uri=Config.GOOGLE_REDIRECT_URI,
    )
    flow.fetch_token(code=code)
    return flow.credentials


def credentials_to_dict(credentials):
    """
    Serialize credentials to a dictionary for session storage.
    Args:
        credentials: google.oauth2.credentials.Credentials
    Returns:
        dict with token data
    """
    return {
        "token": credentials.token,
        "refresh_token": credentials.refresh_token,
        "token_uri": credentials.token_uri,
        "client_id": credentials.client_id,
        "client_secret": credentials.client_secret,
        "scopes": list(credentials.scopes) if credentials.scopes else Config.SCOPES,
    }


def credentials_from_dict(creds_dict):
    """
    Deserialize credentials from a session-stored dictionary.
    Args:
        creds_dict: dict with token data
    Returns:
        google.oauth2.credentials.Credentials
    """
    return Credentials(
        token=creds_dict["token"],
        refresh_token=creds_dict.get("refresh_token"),
        token_uri=creds_dict["token_uri"],
        client_id=creds_dict["client_id"],
        client_secret=creds_dict["client_secret"],
        scopes=creds_dict.get("scopes"),
    )


def refresh_if_expired(credentials):
    """
    Refresh credentials if they have expired.
    Args:
        credentials: google.oauth2.credentials.Credentials
    Returns:
        Refreshed credentials (or original if still valid)
    Raises:
        Exception if refresh fails (e.g., refresh token revoked)
    """
    if credentials.expired and credentials.refresh_token:
        credentials.refresh(Request())
    return credentials


def get_user_info(credentials):
    """
    Fetch the authenticated user's profile info from Google.
    Args:
        credentials: valid Google OAuth credentials
    Returns:
        dict with user profile data (name, email, picture)
    """
    from googleapiclient.discovery import build

    service = build("oauth2", "v2", credentials=credentials)
    user_info = service.userinfo().get().execute()
    return {
        "name": user_info.get("name", ""),
        "email": user_info.get("email", ""),
        "picture": user_info.get("picture", ""),
    }
