

import google.generativeai as genai
import os
# import json
from IPython.display import Image
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import logging
from Mysecrets import GOOGLE_API_KEY
# Configure logging
logging.basicConfig(level=logging.INFO)


def detectDrugFromText(text, ind):
    # print(text[0])
    try:
        genai.configure(api_key=GOOGLE_API_KEY[ind])

        # Choose the Generative Model
        model = genai.GenerativeModel(model_name='gemini-1.5-flash')
        prompt_text = f"""
This are posts found on social media channel potentially selling drugs,
the posts are in the format 
<'keyword': 'SearchKeyword',
'content': 'name\nusername\npost_content',
'images': []>

identify the posts with potential indicators of illicit drug trafficking:
{text}
give Output strictly as JSON: for example 
{{"keyword":<SearchKeyword>,
"results":[{{
  
  "sender":<username>,
  "message" : "post_content",
  "images":['<array of images as it is>']
  "drug_related_terms": [
    "cocaine",
    "heroin",
    "methamphetamine",
    "cannabis",
    "LSD",
    "MDMA",
    "PCP",
    "ketamine"
  ],
  "code_words": [
    "white powder",
    "herb",
    "shrooms",
    // Add more code words as needed
  ],
  "drug_trafficking_indicators": [
    "cryptocurrency transactions",
    "dark web marketplaces",
    "encrypted communication",
    "use of specific lingo or slang",
    "references to specific drug routes or locations"
  ],
  "potential_drug_trafficking_detected": "true"/"false",
  "confidence_level": "high"/"medium"/"low",
  "links":[],
  "usernames":[]
 }}],}}
        """
        response = model.generate_content([prompt_text],
                                          safety_settings={
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        })

        # Print the response
        return response.text.strip().split('```')[1].strip('\n').strip('json').strip('\n')

    except Exception as e:
        # logging.error(f"Error in detectDrugFromImage: {e}")
        print(f"Error: {e}")
        return """{
            "results": []"
        }"""


# print(detectDrugFromText([{
#     "keyword": "marijuana",
#     "content": "marijuana happy hour\n@marijuanahappy\n·\n1h\nmullet Camara show\nmullet Camara show\nFrom rumble.com\n3",
#     "images": []
# }, {
#     "keyword": "marijuana",
#     "content": "縁\n@marijuana_otoko\n·\n1h\n안 친한 건 절대 아니에요 x 실제로도 친합니다 씨피\n한탯 친한거 축하합니다\n82",
#     "images": [
#         "https://pbs.twimg.com/media/GeBarvva0AA7wJE?format=jpg&name=small",
#         "https://pbs.twimg.com/media/GeBarvubMAAGgj-?format=jpg&name=360x360"
#     ]
# },
#     {
#         "keyword": "marijuana",
#         "content": "C.\n@End_MEDUSA\n·\n5h\n“we already did a smear campaign against her taxi driving” “she wants to be a taxi driver to buy things from Trump & medical marijuana” I’d have to renew my 329 card for medical marijuana. I want to legalize cannabis. I want to buy Christmas items from Trump.\n12",
#         "images": []
# }, {
#         "keyword": "marijuana",
#         "content": "Jeff Hancock\n@xpertss97_jeff\n·\n6h\nReplying to \n@curemecfs\nIn Babel, some kid shoots his new rifle at a tour bus and hits Brad Pits wife so marijuana is used as anesthesia #tragedy\nyoutube.com\nBabel (1/10) Movie CLIP - Shot in Morocco (2006) HD\nBabel movie clips: http://j.mp/15vX45FBUY THE MOVIE: http://amzn.to/tbeAVXDon't miss the HOTTEST NEW TRAILERS: http://bit.ly/1u2y6prCLIP DESCRIPTION:Susan (C...\n11",
#         "images": []
# }, {
#         "keyword": "marijuana",
#         "content": "Marijuana Primadonna\n@MuvaShayDollaz\n·\n6h\nThe way I get nonchalant after needs to be studied. Lmao. Baby I will ghost you before you ghost me.\n10",
#         "images": []
# },
#     {
#         "keyword": "marijuana",
#         "content": "Marijuana\n@limanosman55\n·\n6h\nReplying to \n@elifbers\n and \n@gusholderhaber\n7",
#         "images": []
# },
#     {
#         "keyword": "marijuana",
#         "content": "John Hughes\n@JohnHug52765174\n·\n6h\nReplying to \n@stillgray\nMarijuana is not for everyone.\nIt can turn some people over the edge who suffer from types of mental illness.\nPeople who push a blanket “ No problem doctrine” are just following a cult mentality.\n9",
#         "images": []
# }]))