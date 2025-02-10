from TelegramChannelScraper import TelegramChannelScraper
import asyncio
from Secrets import creds
# Create a scraper object and pass in API credentials
scraper = TelegramChannelScraper(
    credentials=creds
)
asyncio.run(
scraper.get_messages(channel_name='betwiner_Movies_aviator_laynbet')
)