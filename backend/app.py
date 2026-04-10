"""
NaveenHub Drive Assistant — Flask Application
Main entry point. Sets up Flask app with CORS, sessions, and route blueprints.
"""

import os
from datetime import timedelta
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.auth import auth_bp
from routes.drive import drive_bp


def create_app():
    """
    Application factory — creates and configures the Flask app.
    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # ── Core Configuration ──────────────────────────────────────
    app.secret_key = Config.SECRET_KEY
    app.permanent_session_lifetime = timedelta(seconds=Config.PERMANENT_SESSION_LIFETIME)
    app.config["SESSION_COOKIE_SAMESITE"] = Config.SESSION_COOKIE_SAMESITE
    app.config["SESSION_COOKIE_SECURE"] = Config.SESSION_COOKIE_SECURE

    # ── CORS ────────────────────────────────────────────────────
    # Allow frontend origin with credentials (cookies)
    CORS(
        app,
        origins=[Config.FRONTEND_URL],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "DELETE", "OPTIONS"],
    )

    from routes.chat import chat_bp

    # ── Register Blueprints ─────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(drive_bp)
    app.register_blueprint(chat_bp)

    # ── Health Check ────────────────────────────────────────────
    @app.route("/")
    def health_check():
        """Health check endpoint for deployment platforms."""
        return jsonify({
            "status": "healthy",
            "app": "NaveenHub Drive Assistant API",
            "version": "1.0.0",
        }), 200

    # ── Global Error Handlers ───────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


# ── Initialize Global App Instance for Vercel ───────────────────
# Vercel's python builder imports `app` from here rather than 
# running __main__.
app = create_app()

# Allow OAuth over HTTP during local development. 
# Vercel will run strictly on HTTPS natively, so this is for local testing.
if os.environ.get("FLASK_ENV") == "development" or os.environ.get("OAUTHLIB_INSECURE_TRANSPORT") == "1":
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

# ── Entry Point (Local Execution) ───────────────────────────────
if __name__ == "__main__":
    # Validate config on startup
    try:
        Config.validate()
    except ValueError as e:
        print(f"⚠️  Configuration Error: {e}")
        print("   Create a .env file with the required variables. See .env.example")
        exit(1)

    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
