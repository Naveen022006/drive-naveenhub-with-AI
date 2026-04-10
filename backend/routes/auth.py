"""
Authentication routes.
Handles Google OAuth 2.0 login flow, callback, logout, and user info.
"""

from flask import Blueprint, redirect, request, session, jsonify, url_for
from services.google_auth import (
    get_auth_url,
    exchange_code,
    credentials_to_dict,
    credentials_from_dict,
    refresh_if_expired,
    get_user_info,
)
from config import Config

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login")
def login():
    """
    Initiate Google OAuth flow.
    Redirects the user to Google's consent screen.
    """
    try:
        authorization_url, state = get_auth_url()
        session["oauth_state"] = state
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": f"Failed to initiate login: {str(e)}"}), 500


@auth_bp.route("/callback")
def callback():
    """
    Handle Google OAuth callback.
    Exchanges the authorization code for credentials, stores them in session,
    and redirects the user to the frontend dashboard.
    """
    try:
        code = request.args.get("code")
        if not code:
            return redirect(f"{Config.FRONTEND_URL}?error=no_code")

        # Exchange authorization code for credentials
        credentials = exchange_code(code)

        # Store credentials in server-side session
        session["credentials"] = credentials_to_dict(credentials)

        # Fetch and store user info
        user_info = get_user_info(credentials)
        session["user"] = user_info

        # Make session permanent (uses PERMANENT_SESSION_LIFETIME)
        session.permanent = True

        # Redirect to frontend dashboard
        return redirect(f"{Config.FRONTEND_URL}/dashboard")

    except Exception as e:
        return redirect(f"{Config.FRONTEND_URL}?error={str(e)}")


@auth_bp.route("/logout")
def logout():
    """
    Clear the user's session and redirect to frontend login.
    """
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/user")
def get_current_user():
    """
    Return the currently authenticated user's info.
    Used by the frontend to check authentication status.
    """
    if "credentials" not in session:
        return jsonify({"authenticated": False}), 401

    try:
        # Refresh credentials if expired
        creds_dict = session["credentials"]
        credentials = credentials_from_dict(creds_dict)
        credentials = refresh_if_expired(credentials)

        # Update session with refreshed credentials
        session["credentials"] = credentials_to_dict(credentials)

        user = session.get("user", {})
        return jsonify({
            "authenticated": True,
            "user": user,
        }), 200

    except Exception as e:
        # Token is invalid/revoked — clear session
        session.clear()
        return jsonify({
            "authenticated": False,
            "error": f"Session expired: {str(e)}",
        }), 401
