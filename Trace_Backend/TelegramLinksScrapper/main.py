from flask import Flask, request, jsonify
import asyncio
from telethon import TelegramClient
from telethon.errors import UserAlreadyParticipantError
from telethon.tl.functions.channels import JoinChannelRequest
from Secrets import creds

# Initialize Flask app
app = Flask(__name__)

# Telegram credentials
api_id = creds["api_id"]
api_hash = creds["api_hash"]
phone_number = creds["phone"]

# Initialize Telegram client
client = TelegramClient('New', api_id, api_hash)

@app.route('/join_channel', methods=['POST'])
def join_channel():
    data = request.json
    links = data.get('links', [])

    if not links:
        return jsonify({"error": "No links provided"}), 400

    try:
        asyncio.run(process_join_requests(links))
        return jsonify({"message": "Join requests processed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

async def process_join_requests(links):
    async with client:
        await client.start(phone=phone_number)
        print("Client connected")
        for link in links:
            try:
                if "/joinchat/" in link or link.startswith("https://t.me/+"):
                    # Handle private links
                    result = await client(JoinChannelRequest(link))
                    print(f"Successfully joined the channel: {result.chats[0].title}")
                else:
                    # Handle public links
                    username = link.split("/")[-1]
                    result = await client(JoinChannelRequest(username))
                    print(f"Successfully joined the channel: {result.chats[0].title}")

            except UserAlreadyParticipantError:
                print("You are already a participant of this channel.")
            except Exception as e:
                print(f"Failed to join the channel: {e}")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
