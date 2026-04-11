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
    # Serve static files from the frontend's dist directory
    import os
    dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist'))
    app = Flask(__name__, static_folder=dist_dir, static_url_path='/')

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
    @app.route("/api/health")
    def health_check():
        """Health check endpoint for deployment platforms."""
        return jsonify({
            "status": "healthy",
            "app": "NaveenHub Drive Assistant API",
            "version": "1.0.0",
        }), 200

    # ── Serve Frontend SPA ──────────────────────────────────────
    from flask import send_from_directory
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        """Catch-all route to serve React SPA and its static assets."""
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return send_from_directory(app.static_folder, 'index.html')
        return jsonify({"error": "Frontend build not found. Run npm run build."}), 404

    # ── Global Error Handlers ───────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


# ── Global App Instance for WSGI (e.g. Gunicorn) ───────────────
app = create_app()

# ── Entry Point (Local Development Only) ────────────────────────
if __name__ == "__main__":
    # Validate config on startup
    try:
        Config.validate()
    except ValueError as e:
        print(f"⚠️  Configuration Error: {e}")
        print("   Create a .env file with the required variables. See .env.example")
        exit(1)

    # Allow OAuth over HTTP during local development
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

    app.run(host="0.0.0.0", port=5000, debug=Config.DEBUG)
