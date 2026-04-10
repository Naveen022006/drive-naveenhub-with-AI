"""
Utility helpers for the NaveenHub Drive Assistant backend.
"""

from functools import wraps
from flask import session, jsonify


def format_file_size(size_bytes):
    """
    Convert a file size in bytes to a human-readable string.
    Args:
        size_bytes: file size in bytes (int)
    Returns:
        str like "1.5 MB", "320 KB", etc.
    """
    if size_bytes == 0:
        return "—"

    units = ["B", "KB", "MB", "GB", "TB"]
    size = float(size_bytes)

    for unit in units:
        if size < 1024:
            return f"{size:.1f} {unit}" if size != int(size) else f"{int(size)} {unit}"
        size /= 1024

    return f"{size:.1f} PB"


def require_auth(f):
    """
    Decorator that ensures the request has valid credentials in the session.
    Returns 401 if not authenticated.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "credentials" not in session:
            return jsonify({
                "error": "Not authenticated. Please sign in.",
                "authenticated": False,
            }), 401
        return f(*args, **kwargs)
    return decorated_function


def error_response(message, status_code=400):
    """
    Create a standardized error JSON response.
    Args:
        message: error description string
        status_code: HTTP status code (default 400)
    Returns:
        Flask JSON response tuple
    """
    return jsonify({"error": message}), status_code


def success_response(data, message="Success", status_code=200):
    """
    Create a standardized success JSON response.
    Args:
        data: response payload (dict or list)
        message: success message
        status_code: HTTP status code (default 200)
    Returns:
        Flask JSON response tuple
    """
    return jsonify({"message": message, "data": data}), status_code
