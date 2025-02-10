import asyncio
import websockets
import json
import random
from datetime import datetime
from Secrets import secrets

from Routes.Scrapper.main2 import search_public_entities_and_check_content
import asyncio
from telethon import TelegramClient
# Generator function that yields dict objects
client = TelegramClient('New', secrets["api_id"], secrets["api_hash"])
connected_clients = set()

async def generate_data(keyword):
    async with client:
        
        async for channel_details in search_public_entities_and_check_content(client, keyword):
            yield(channel_details)

async def handle_connection(websocket):
    connected_clients.add(websocket)
    try:
        # Wait for the client to send a keyword
        keyword_message = await websocket.recv()
        data = json.loads(keyword_message)
        keyword = data.get("keyword")

        if not keyword:
            await websocket.send(json.dumps({"error": "Keyword is required"}))
            return

        print(f"Client connected with keyword: {keyword}")
        
        async for generated_data in generate_data(keyword):
            await websocket.send(json.dumps(generated_data))

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client disconnected: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        connected_clients.remove(websocket)
        print("Connection closed.")


async def main():
    print("Starting WebSocket server on ws://localhost:8080")
    async with websockets.serve(handle_connection, "localhost", 8080):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
