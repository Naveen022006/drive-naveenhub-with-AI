"""
Google Drive routes.
Handles file listing, upload, download, and deletion.
"""

import io
from flask import Blueprint, request, session, jsonify, send_file
from services.google_auth import credentials_from_dict, refresh_if_expired, credentials_to_dict
from services.google_drive import (
    build_drive_service,
    list_files,
    upload_file,
    download_file,
    delete_file,
)
from utils.helpers import format_file_size, require_auth

drive_bp = Blueprint("drive", __name__)


@drive_bp.route("/files")
@require_auth
def get_files():
    """
    List all files from the user's Google Drive.
    Query params:
        - page_size: number of files to return (default 50)
        - q: Drive API search query
        - folder_id: the parent folder ID (default root)
    """
    try:
        credentials = _get_credentials()
        service = build_drive_service(credentials)

        page_size = request.args.get("page_size", 50, type=int)
        query = request.args.get("q", None)
        folder_id = request.args.get("folder_id", "root")

        files = list_files(service, page_size=page_size, query=query, folder_id=folder_id)

        # Add human-readable file sizes
        for f in files:
            f["sizeFormatted"] = format_file_size(int(f.get("size", 0)))

        return jsonify({"files": files, "count": len(files)}), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch files: {str(e)}"}), 500


@drive_bp.route("/upload", methods=["POST"])
@require_auth
def upload():
    """
    Upload a file to Google Drive.
    Expects a multipart/form-data request with a 'file' field.
    Can also accept 'folder_id' in form data to target a specific directory.
    """
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        folder_id = request.form.get("folder_id", "root")

        credentials = _get_credentials()
        service = build_drive_service(credentials)

        # Read file into a BytesIO stream
        file_stream = io.BytesIO(file.read())
        mime_type = file.content_type or "application/octet-stream"

        result = upload_file(service, file_stream, file.filename, mime_type, parent_id=folder_id)

        return jsonify({
            "message": "File uploaded successfully",
            "file": result,
        }), 201

    except Exception as e:
        return jsonify({"error": f"Upload failed: {str(e)}"}), 500


@drive_bp.route("/download/<file_id>")
@require_auth
def download(file_id):
    """
    Download a file from Google Drive.
    Google Workspace files are auto-exported to standard formats.
    """
    try:
        credentials = _get_credentials()
        service = build_drive_service(credentials)

        file_buffer, file_meta = download_file(service, file_id)

        return send_file(
            file_buffer,
            as_attachment=True,
            download_name=file_meta["name"],
            mimetype=file_meta.get("mimeType", "application/octet-stream"),
        )

    except Exception as e:
        return jsonify({"error": f"Download failed: {str(e)}"}), 500


@drive_bp.route("/delete/<file_id>", methods=["DELETE"])
@require_auth
def delete(file_id):
    """
    Delete a file from Google Drive.
    """
    try:
        credentials = _get_credentials()
        service = build_drive_service(credentials)

        delete_file(service, file_id)

        return jsonify({"message": "File deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": f"Delete failed: {str(e)}"}), 500


def _get_credentials():
    """
    Retrieve and refresh credentials from the session.
    Returns refreshed google.oauth2.credentials.Credentials.
    """
    creds_dict = session["credentials"]
    credentials = credentials_from_dict(creds_dict)
    credentials = refresh_if_expired(credentials)
    # Persist the refreshed token back to session
    session["credentials"] = credentials_to_dict(credentials)
    return credentials
