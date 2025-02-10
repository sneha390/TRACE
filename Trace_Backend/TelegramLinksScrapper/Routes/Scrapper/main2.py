import json
from PIL.ExifTags import TAGS, GPSTAGS
from PIL import Image
from telethon.errors import FloodWaitError
import asyncio
from Secrets import secrets
from telethon.tl.functions.messages import SearchGlobalRequest
import os
from telethon import TelegramClient
from telethon import functions, types
import re

from Service.imageDescription import detectDrugFromImage
from Service.index import imageFileDetection
from Service.textAnalysis import detectDrugFromText


def normalize_text(text):
    # Remove spaces, dots, and special characters
    text = re.sub(r'\W+', '', text)
    # Convert to lowercase
    return text.lower()


def extract_links_regex(text):
    if not text:
        return []
    url_pattern = r'(https?://\S+)'
    urls = re.findall(url_pattern, text)
    return urls


drug_patterns = [
    r'm\W*a\W*r\W*i\W*h\W*u\W*a\W*n\W*a',  # marijuana
    r'h\W*a\W*s\W*h',  # hash
    r'm\W*d\W*m\W*a',  # mdma
    r'k\W*e\W*t\W*a\W*m\W*i\W*n\W*e'  # ketamine
]


def detect_drugs(text, patterns):
    text = normalize_text(text)
    for pattern in patterns:
        if re.search(pattern, text):
            return True
    return False


drug_emojis = ['🍀', '🥥', '💨', '🖊️', '🍁', '🍄', '❄️', '💊']
drug_keywords = ['marijuana', 'weed', 'hash', 'shroom', 'pills', 'coke'
                 'mdma', 'cocaine', 'ketamine', "cannabis"]


def normalize_text(text):
    return re.sub(r'\W+', '', text).lower()


def contains_drug_references(message):
    if (message == None):
        return False
    res = []
    normalized_message = normalize_text(message)

    for keyword in drug_keywords:
        if keyword in normalized_message:
            res.append(keyword)
    if (len(res) > 0):
        print("Info found:", end="")
        print(res)
        return True

    return False


def extractContacts(message, s1, s2):
    if(message == None):
        return
    username_pattern = r'@\w+'
    phone_number_pattern = r'\+?\d{1,3}\s?\d{1,4}\s?\d{1,4}\s?\d{1,9}'
    phone_numbers = re.findall(phone_number_pattern, message)
    usernames = re.findall(username_pattern, message)
    for nos in phone_numbers:
        if len(nos) >= 10:
            s1.append(nos)
    for un in usernames:
        s2.append(un)


def extract_metadata(image_path):
    try:
        with Image.open(image_path) as img:
            metadata = img._getexif()
            if metadata:
                readable_metadata = {}
                for tag_id, value in metadata.items():
                    tag_name = TAGS.get(tag_id, tag_id)
                    readable_metadata[tag_name] = value
                return readable_metadata
    except (AttributeError, OSError):
        return None


def getLocation(image_path):
    res = extract_metadata(image_path=image_path)
    if (res):
        l = res["GPSInfo"]
        return f"{l[2][0]}°{l[2][1]}'{l[2][2]}''N{l[4][0]}°{l[4][1]}'{l[4][2]}''"
    return "None"


async def search_public_entities_and_check_content(client, keyword):
    result = await SearchGlobalRequest(functions.contacts.SearchRequest(
        q=keyword,
        limit=25
    ))

    total = 0
    flag = False
    for chat in result.users:
        flag = False
        try:
            if isinstance(chat, types.User) and chat.username:
                bot = await client(functions.users.GetFullUserRequest(chat.username))
                bot_description=""
                if (bot.full_user.bot_info):
                    bot_description = bot.full_user.bot_info.description

                photo = await client.download_profile_photo(chat.id, file=f"Media/Images/bot_logo_{total}.jpg")
                print(f"Image saved: {photo}")
                if (photo):
                    logo_result, image_url = imageFileDetection(
                        f"Images bot_logo_{total}.jpg")
                else:
                    logo_result, image_url = r'{"DrugIdentified": "false"}', ""
                # print(logo_result)
                # if (photo and logo_result):
                #     for i in logo_result.concepts:
                #         if i.name == 'drug' and i.value > 0.7:
                #             flag = True
                #             break
                logo_result = json.loads(logo_result)
                if (logo_result["DrugIdentified"] and logo_result["DrugIdentified"] == "true"):
                    flag = True
                res = {}
                if contains_drug_references(bot_description) or flag:
                    res["type"] = "TelegramUser/Bot"
                    res["username"] = chat.username
                    res["contacts found"] = []
                    res["usernames found"] = []
                    extractContacts(bot_description,
                                    res["contacts found"], res["usernames found"])
                    res["links found"] = extract_links_regex(bot_description)
                    if (flag):
                        res["logo url"] = image_url
                        res["logo description"] = logo_result
                        res["locationData"] = getLocation(
                            f"Media/Images/bot_logo_{total}.jpg")
                    res["keyword"] = keyword
                yield res

            total += 1
        except FloodWaitError as e:
            print(
                f"FloodWaitError: Waiting for {e.seconds} seconds before retrying...")
            await asyncio.sleep(e.seconds)
    total = -1
    for chat in result.chats:
        total += 1
        flag = False
        users = set()
        try:
            if isinstance(chat, types.Channel):
                channel_details = {}
                channel_details["type"] = "TelegramChannel"
                channel_details["title"] = f"{chat.title}" if hasattr(
                    chat, 'title') else "Unknown"
                channel_details["links"] = []
                channel_details["drug_messages"] = []
                # Check the description for drug-related content (if available)
                texts = []
                if hasattr(chat, 'about'):
                    texts.append(f"ChannelDescription: {chat.about}")

                # **Fetch and process the channel logo**
                if chat.photo:
                    # Download the channel's profile picture (logo)
                    photo = await client.download_profile_photo(chat.id, file=f"Media/Images/channel_logo_{total}.jpg")
                    print(f"Image saved: {photo}")
                    if photo:
                        # Pass the downloaded logo to your drug detection function (optional)

                        logo_result, logo_url = imageFileDetection(
                            f"Images channel_logo_{total}.jpg")
                        logo_result = json.loads(logo_result)
                        channel_details["logo url"] = logo_url
                        channel_details["logo description"] = logo_result
                        # Here
                        if logo_result["DrugIdentified"] == "true":
                            flag = True
                    else:
                        channel_details["logo description"], channel_details["logo url"] = {
                            "DrugIdentified": "false"}, "None"
                        print(f"No profile photo found for chat ID {total}")

                # Fetch messages from the channel, group, or bot
                media_details = []
                m_total = -1
                async for message in client.iter_messages(chat.id, limit=20):
                    m_total += 1
                    sender = await message.get_sender()
                    sender = sender.username
                    users.add(sender)

                    if message.text:
                        texts.append(f"{sender} : {message.text}")

                    if message.entities:
                        for entity in message.entities:
                            if isinstance(entity, types.MessageEntityUrl):
                                link = message.text[entity.offset:entity.offset + entity.length]

                                channel_details["links"].append(link)
                    if message.media and isinstance(message.media, types.MessageMediaPhoto):
                        # Download the image from the message
                        image = await message.download_media(file=f"Media/Images/channelmessage{m_total}.jpg")
                        print(f"Image saved: {image}")
                        if image:
                            logo_result, image_url = imageFileDetection(
                                f"Images channelmessage{m_total}.jpg")
                            logo_result = json.loads(logo_result)
                            img_res = {"sender": f"{sender}",
                                       "image url": image_url,
                                       "image description": logo_result
                                       }
                            # if (logo_result):
                            #     for i in logo_result.concepts:
                            #         if i.name == 'drug' and i.value > 0.7:
                            #             flag = True
                            #             desc = detectDrugFromImage(
                            #                 f"Images/channelmessage{m_total}.jpg")
                            #             img_res["image description"] = desc
                            #             img_res["flag"] = 'drug'
                            #             break
                            #         else:
                            #             img_res["image description"] = "None"
                            #             img_res["flag"] = i.name
                            img_res["locationData"] = getLocation(
                                f"Media/Images/channelmessage{m_total}.jpg")
                            media_details.append(img_res)

                channel_details["media"] = media_details
                channel_details["messages analysis"] = detectDrugFromText(
                    texts)
                channel_details["keyword"] = keyword
                channel_details["Users"] = []
                for u in users:
                    user = await client.get_entity(u)
                    try:
                        temp = {
                        "id": user.id,
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    }
                    except Exception as e:
                        print(e)
                        
                    if hasattr(user,"phone"):
                        temp["phone"]= user.phone
                    channel_details["Users"].append(temp)
                        
                # if (flag):
                yield channel_details
        except FloodWaitError as e:
            print(
                f"FloodWaitError: Waiting for {e.seconds + 3} seconds before retrying...")
            await asyncio.sleep(e.seconds)
        except Exception as e:
            print(f"Error: {e}")
    print(total)


# keyword = input("Enter a keyword to look for: ")
# keyword = 'movies'
# asyncio.run(search_public_entities_and_check_content(keyword=keyword))

# async def main():
#     async with client:
#         try:
#             async for channel_details in search_public_entities_and_check_content(keyword):
#                 # Process the channel details
#                 print(channel_details)
#             print("Done")
#         except Exception as e:
#             print(e)

# asyncio.run(main())

# # robot
# # 💊🍄🍁🍀
# # ogkush
# # 🍀🥥💨🖊️🍁❄️
