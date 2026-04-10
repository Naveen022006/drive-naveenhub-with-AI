"""
Google Drive API service.
Provides functions for listing, uploading, downloading, and deleting files.
"""

import io
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload, MediaIoBaseDownload


def build_drive_service(credentials):
    """
    Build an authenticated Google Drive v3 service client.
    Args:
        credentials: google.oauth2.credentials.Credentials
    Returns:
        googleapiclient.discovery.Resource (Drive v3)
    """
    return build("drive", "v3", credentials=credentials)


def list_files(service, page_size=50, query=None, folder_id="root"):
    """
    List files from the user's Google Drive.
    Args:
        service: authenticated Drive v3 service
        page_size: max number of files to return (default 50)
        query: optional Drive API search query string
        folder_id: the parent folder ID (default "root")
    Returns:
        list of file metadata dicts
    """
    params = {
        "pageSize": page_size,
        "fields": "nextPageToken, files(id, name, mimeType, size, createdTime, "
                  "modifiedTime, iconLink, webViewLink, thumbnailLink, owners)",
        "orderBy": "folder, modifiedTime desc",
    }

    base_query = f"'{folder_id}' in parents and trashed=false"
    if query:
        params["q"] = f"{base_query} and name contains '{query}'"
    else:
        params["q"] = base_query

    results = service.files().list(**params).execute()
    files = results.get("files", [])

    return [
        {
            "id": f["id"],
            "name": f["name"],
            "mimeType": f.get("mimeType", "unknown"),
            "size": f.get("size", "0"),
            "createdTime": f.get("createdTime", ""),
            "modifiedTime": f.get("modifiedTime", ""),
            "iconLink": f.get("iconLink", ""),
            "webViewLink": f.get("webViewLink", ""),
            "thumbnailLink": f.get("thumbnailLink", ""),
            "owners": [o.get("displayName", "") for o in f.get("owners", [])],
        }
        for f in files
    ]


def upload_file(service, file_stream, filename, mime_type, parent_id="root"):
    """
    Upload a file to Google Drive.
    Args:
        service: authenticated Drive v3 service
        file_stream: file-like object with the file content
        filename: name for the uploaded file
        mime_type: MIME type of the file
        parent_id: ID of the folder to upload into
    Returns:
        dict with uploaded file metadata (id, name, mimeType)
    """
    file_metadata = {
        "name": filename,
        "parents": [parent_id]
    }

    media = MediaIoBaseUpload(
        file_stream,
        mimetype=mime_type,
        resumable=True,
    )

    uploaded = (
        service.files()
        .create(
            body=file_metadata,
            media_body=media,
            fields="id, name, mimeType, size, webViewLink",
        )
        .execute()
    )

    return {
        "id": uploaded["id"],
        "name": uploaded["name"],
        "mimeType": uploaded.get("mimeType", ""),
        "size": uploaded.get("size", "0"),
        "webViewLink": uploaded.get("webViewLink", ""),
    }


def download_file(service, file_id):
    """
    Download a file from Google Drive.
    Args:
        service: authenticated Drive v3 service
        file_id: Google Drive file ID
    Returns:
        tuple of (file_bytes: io.BytesIO, file_metadata: dict)
    Raises:
        Exception for Google Workspace files (Docs, Sheets, etc.)
    """
    # Get file metadata first
    file_meta = (
        service.files()
        .get(fileId=file_id, fields="id, name, mimeType, size")
        .execute()
    )

    mime_type = file_meta.get("mimeType", "")

    # Google Workspace files need to be exported
    export_map = {
        "application/vnd.google-apps.document": (
            "application/pdf",
            ".pdf",
        ),
        "application/vnd.google-apps.spreadsheet": (
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xlsx",
        ),
        "application/vnd.google-apps.presentation": (
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".pptx",
        ),
    }

    buffer = io.BytesIO()

    if mime_type in export_map:
        export_mime, ext = export_map[mime_type]
        request = service.files().export_media(
            fileId=file_id, mimeType=export_mime
        )
        file_meta["name"] += ext
        file_meta["mimeType"] = export_mime
    else:
        request = service.files().get_media(fileId=file_id)

    downloader = MediaIoBaseDownload(buffer, request)
    done = False
    while not done:
        _, done = downloader.next_chunk()

    buffer.seek(0)
    return buffer, file_meta


def delete_file(service, file_id):
    """
    Delete (trash) a file from Google Drive.
    Args:
        service: authenticated Drive v3 service
        file_id: Google Drive file ID
    Returns:
        True if successful
    """
    service.files().delete(fileId=file_id).execute()
    return True
