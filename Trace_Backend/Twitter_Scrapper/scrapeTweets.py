import asyncio
import json
import os
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from Mysecrets import email, username, password
# from Service.clarifaiScript import checkDrugFromImage
from Service.imageDescription import detectDrugFromImage
from Service.textAnalysis import detectDrugFromText

# Auto-login function


def auto_login(driver, username, password):
    login_url = "https://x.com/login"
    driver.get(login_url)

    # Wait for username input
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "text")))
    username_input = driver.find_element(By.NAME, "text")
    username_input.send_keys(username)
    username_input.send_keys(Keys.RETURN)

    # Wait for email input (if applicable)
    try:
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.NAME, "text")))
        email_input = driver.find_element(By.NAME, "text")
        email_input.send_keys(email)
        email_input.send_keys(Keys.RETURN)
    except Exception as e:
        print("Email input step skipped:", e)

    # Wait for password input
    WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, "password")))
    password_input = driver.find_element(By.NAME, "password")
    password_input.send_keys(password)
    password_input.send_keys(Keys.RETURN)
    WebDriverWait(driver, 10).until(EC.url_contains("home"))

# Asynchronous scraping function


async def scrape_tweets(driver, keyword, max_tweets=100):
    print(f"Scraping tweets for: {keyword}")
    search_url = f"https://x.com/search?q={keyword}&src=typed_query&f=live"
    driver.get(search_url)
    WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located(
        (By.XPATH, "//article[@data-testid='tweet']")))

    count = 0
    scroll_pause = 3

    async def extract_tweets():
        nonlocal count
        seen_tweets = [None] * 10
        ind = 0
        tweets = driver.find_elements(
            By.XPATH, "//article[@data-testid='tweet']")
        for tweet in tweets:
            try:
                content = tweet.text.strip()
                image_elements = tweet.find_elements(
                    By.XPATH, ".//img[contains(@src, 'https://pbs.twimg.com/media/')]")
                image_urls = [img.get_attribute("src")
                              for img in image_elements]
                for i in range(len(image_urls)):
                    url = image_urls[i]
                    try:
                        # replace with your img locator
                        # img_element = driver.find_element(
                        #     By.XPATH, "//img[@src='image_url_or_xpath']")
                        # try:
                        #     img_url = img_element.get_attribute("src")
                        # except:
                        #     img_url = None

                        if url:
                            response = requests.get(url, stream=True)
                            response.raise_for_status()  # Raise an exception for bad status codes

                            # specify where to save
                            filename = os.path.join(
                                "./Images/", "image.jpg")
                            with open(filename, 'wb') as f:
                                for chunk in response.iter_content(chunk_size=8192):
                                    f.write(chunk)
                            print(f"Image downloaded to: {filename}")
                            image_res = detectDrugFromImage(filename, ind%2)
                            # print("Images res: " + image_res)
                        else:
                            print("Image URL not found.")
                            image_res="None"

                    except Exception as e:
                        print(f"An error occurred: {e}")
                        image_res = "None"

                    image_urls[i] = {
                        "url": url,
                        "image_description": image_res
                    }

                seen_tweets[ind] = {"keyword": keyword,
                                    "content": content, "images": image_urls}
                count += 1

                if ind == 9:
                    analyse_posts = detectDrugFromText(seen_tweets, ind % 2)
                    # if len(analyse_posts) > 25:
                    yield analyse_posts
                ind = (ind + 1) % 10
            except Exception as e:
                print(f"Error extracting tweet: {e}")

    last_height = driver.execute_script("return document.body.scrollHeight")
    while count < max_tweets:
        async for res in extract_tweets():
            if res:
                yield res
        driver.execute_script(
            "window.scrollTo(0, document.body.scrollHeight);")
        await asyncio.sleep(scroll_pause)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

    print(f"Completed scraping for {keyword}. Total tweets: {count}.")

# Main scraping function


async def scrapeTweets(keyword):
    chrome_options = Options()
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_argument(
        "--disable-blink-features=AutomationControlled")
    chrome_options.add_argument("--disable-gpu")
    # chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    service = Service("/usr/lib/chromium-browser/chromedriver")
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        auto_login(driver, username, password)
        async for res in scrape_tweets(driver, keyword):
            yield (res)
    finally:
        driver.quit()

# Run the scraper
# asyncio.run(scrapeTweets("marijuana"))
