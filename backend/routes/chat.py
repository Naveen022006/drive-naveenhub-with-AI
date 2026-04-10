"""
NaveenHub Drive Assistant — Chat Routes
Handles AI assistant requests, proxying them to internal services or external LLMs via Nvidia NIM.
"""

from flask import Blueprint, request, jsonify
from config import Config
import requests

chat_bp = Blueprint("chat_bp", __name__, url_prefix="/api/chat")


@chat_bp.route("/message", methods=["POST"])
def handle_message():
    """
    Handle a user message sent to the AI assistant using the Nvidia Kimi-k2.5 endpoint.
    """
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error": "Missing 'messages' in request body."}), 400

    user_messages = data.get("messages", [])

    if not Config.NVIDIA_API_KEY:
        return jsonify({
            "error": "NVIDIA_API_KEY is not configured in the .env file."
        }), 503

    try:
        # Prepend a system prompt to guide Kimi
        system_prompt = {
            "role": "system",
            "content": (
                "You are the NaveenHub Drive Assistant, a helpful AI integrated directly into the user's Google Drive dashboard. "
                "You help users manage, search, and understand their files.\n"
                "Keep your answers concise, professional, and helpful. Use markdown for formatting."
            )
        }
        
        # Prepare messages limiting to last 5
        messages = [system_prompt]
        messages.extend(user_messages[-5:])

        invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {Config.NVIDIA_API_KEY}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "moonshotai/kimi-k2.5",
            "messages": messages,
            "max_tokens": 16384,
            "temperature": 1.00,
            "top_p": 1.00,
            "stream": False,
            "chat_template_kwargs": {"thinking": True},
        }

        response = requests.post(invoke_url, headers=headers, json=payload)
        response.raise_for_status()

        response_data = response.json()
        
        # Parse standard OpenAI-style response format
        choices = response_data.get("choices", [])
        if choices and len(choices) > 0:
            reply = choices[0].get("message", {}).get("content", "")
            return jsonify({"reply": reply}), 200
        else:
            print("Nvidia API returned unexpected structure:", response_data)
            return jsonify({"error": "Unexpected AI response format."}), 500

    except requests.exceptions.RequestException as e:
        print(f"HTTP Error calling Nvidia API: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Error Body: {e.response.text}")
        return jsonify({"error": f"Failed to get AI response. Check API key."}), 500
    except Exception as e:
        print(f"Error calling Nvidia API: {str(e)}")
        return jsonify({"error": f"Failed to get AI response: {str(e)}"}), 500
