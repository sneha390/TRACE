"""
Install an additional SDK for JSON schema support Google AI Python SDK

$ pip install google.ai.generativelanguage
"""

import os
import google.generativeai as genai
from google.ai.generativelanguage_v1beta.types import content
from Secrets import GOOGLE_API_KEY2
GEMINI_API_KEY = GOOGLE_API_KEY2
genai.configure(api_key=GEMINI_API_KEY)


def upload_to_gemini(path, mime_type=None):
    """Uploads the given file to Gemini.

    See https://ai.google.dev/gemini-api/docs/prompting_with_media
    """
    file = genai.upload_file(path, mime_type=mime_type)
    print(f"Uploaded file '{file.display_name}' as: {file.uri}")
    return file


# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_schema": content.Schema(
        type=content.Type.OBJECT,
        properties={
            "Description": content.Schema(
                type=content.Type.STRING,
            ),
            "DrugIdentified": content.Schema(
                type=content.Type.BOOLEAN,
            ),
            "PossibleDrugName": content.Schema(
                type=content.Type.ARRAY,
                items=content.Schema(
                    type=content.Type.STRING,
                ),
            ),
            "ConfidenceLevel": content.Schema(
                type=content.Type.INTEGER,
            ),
        },
    ),
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
    system_instruction="This is an image found on social media channel potentially selling drugs, identify if this is a harmful drug?\n",
)

# TODO Make these files available on the local file system
# You may need to update the file paths
files = ["None", "NOne"]

chat_session = model.start_chat(
    history=[
        {
            "role": "user",
            "parts": [
                files[0],
            ],
        },
        {
            "role": "model",
            "parts": [
                "```json\n{\n  \"ConfidenceLevel\": 1,\n  \"Description\": \"The image is a blue diamond, a common motif in some drug trade but not a drug itself.\",\n  \"DrugIdentified\": false,\n  \"PossibleDrugName\": []\n}",
                files[1],
            ],
        },
    ]
)


def detectDrugFromImage(path):
    global files

    files = [upload_to_gemini(f"Media/{path}", mime_type="image/jpeg"),
            upload_to_gemini("Unknown File", mime_type="application/octet-stream")]
    response = chat_session.send_message(f"Media/{path}")
    return response.text

# print(response.text)
