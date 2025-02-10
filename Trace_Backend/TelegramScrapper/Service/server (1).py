# from website import create_app
# from flask import Flask, render_template
# import request
# import asyncio
# from telethon.sync import TelegramClient
# from colorama import init, Fore, Style
# import datetime
# from telethon import TelegramClient
# from telethon.tl.types import UserStatusOffline

# app=create_app()



# apiID = "23140334"
# apiHash = "36aa1484b4e8629c5aa1f7d07b73f07a"
# number = "+919117578170"  
    

# def format_timestamp(timestamp):
#     return datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc).astimezone().strftime(
#         '%Y-%m-%d %H:%M:%S %Z')



# app = Flask(__name__)


# @app.route('/setup')
# def details():
#     if (apiID & number & apiHash  ):
#         print("Credentials found")
#     else:
#         print("Credentials not found ")    


# @app.route('/launch_recon')
# def stop_event_loop():
#     try:

#         loop = asyncio.get_event_loop()

#         loop.stop()

#     except Exception as e:

#         pass


# @app.route('/user_details')
# async def get_user_information(client, identifier, username):
#         user = await client.get_entity(identifier)

#         print(f"{Fore.CYAN}Username:{Style.RESET_ALL} {user.username or 'N/A'}")

#         print(f"{Fore.CYAN}First Name:{Style.RESET_ALL} {user.first_name or 'N/A'}")

#         print(f"{Fore.CYAN}Last Name:{Style.RESET_ALL} {user.last_name or 'N/A'}")

#         print(f"{Fore.CYAN}User ID:{Style.RESET_ALL} {user.id}")

#         if user.phone:
#             print(f"{Fore.CYAN}Phone Number:{Style.RESET_ALL} {user.phone}")

#         if hasattr(user, 'about'):
#             print(f"{Fore.CYAN}Bio:{Style.RESET_ALL} {user.about or 'N/A'}")

#         if user.photo:

#             profile_photo = await client.download_profile_photo(user.id, file=bytes)

#             with open(os.path.join(user_directory, f'{username}_profile.jpg'), 'wb') as file:

#                 file.write(profile_photo)

#             print(f"{Fore.CYAN}Profile Picture:{Style.RESET_ALL} Downloaded and saved as {username}_profile.jpg")

#         else:

#             print(f"{Fore.CYAN}Profile Picture:{Style.RESET_ALL} No")

#         if user.status:

#             if isinstance(user.status, UserStatusOffline):

#                 last_seen = user.status.was_online

#                 last_seen_formatted = format_timestamp(last_seen.timestamp())

#                 print(f"{Fore.CYAN}Last Seen:{Style.RESET_ALL} User was last seen at {last_seen_formatted}")

#             else:

#                 print(f"{Fore.CYAN}Online Status:{Style.RESET_ALL} Online")

#         else:

#             print(f"{Fore.CYAN}Online Status:{Style.RESET_ALL} Offline")

#         if hasattr(user, 'mutual_chats_count'):

#             common_chats = user.mutual_chats_count

#             if common_chats is not None:
#                 print(f"{Fore.CYAN}Common Chats:{Style.RESET_ALL} {common_chats}")

# async def user_details_main():

#     identifier = request.args['identifier']
#     async with TelegramClient('session_name', apiID, apiHash) as client:

#         # Remove "@" symbol from the username if present

#         username = identifier.replace('@', '')

#         # Call the function with the modified username

#         await get_user_information(client, identifier, username)


# @app.route('/')
# def home():
#     return render_template('index.html')  # Serves an HTML page

# if __name__ == '__main__':
#     app.run(debug=True)
