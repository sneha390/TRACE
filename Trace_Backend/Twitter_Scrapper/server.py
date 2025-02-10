import asyncio
import websockets
import json
import random
from datetime import datetime
from scrapeTweets import scrapeTweets
import asyncio
connected_clients = set()

# async def generate_data(keyword):
    # continue

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

        # Start generating and sending data
        async for generated_data in scrapeTweets(keyword):
            await websocket.send(json.dumps(generated_data))

    except websockets.exceptions.ConnectionClosed as e:
        print(f"Client disconnected: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        connected_clients.remove(websocket)
        print("Connection closed.")


async def main():
    print("Starting Twitter WebSocket server on ws://localhost:8081")
    async with websockets.serve(handle_connection, "localhost", 8081):
        await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
