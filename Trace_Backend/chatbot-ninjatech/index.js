import puppeteer from 'puppeteer'
import fs from 'fs/promises'

import { model, generationConfig } from './chatbot.js'
/**
 * CODE TO DOWNLOAD TELEGRAM AUTH TOKKEN
 * var tokens = {};
    for (var i = 0; i < localStorage.length; i++){
        tokens[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
    };
    console.log(tokens);
    
 */

/** chatBot response format
 * {
"isSuspect": "Chatmore",
"nextMessage": "Yo, what's good?",
"chatContinue": true
}


 */

const RUNNING_FIRST_TIME = true
const SEARCH_BAR_ID = '#telegram-search-input'
const CLICKABLE_RESULT_TELEGRAM = 'ListItem chat-item-clickable search-result'
const JOIN_BUTTON = 'Button tiny primary fluid has-ripple'
const INPUTBOX = 'editable-message-text'
const CHANNEL_NAME = ''
const LANGUAGE = 'English'

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const getNextId = (messageId) => {
  const parts = messageId.split('-')
  const prefix = parts[0] // "message"
  const number = parseInt(parts[1], 10) // Convert the number part to an integer
  return `${prefix}-${number + 1}` // Increment and return the new ID
}

;(async () => {
  // Launch a new browser instance
  //Chat session starts here
  const chatSession = model.startChat({
    generationConfig,
    history: [],
  })

  // Open a new page
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    userDataDir: './user_data', // Directory to store browser data
    args: ['--start-maximized'], // Launch the browser maximized
  })

  const page = await browser.newPage()

  // Replace 'YOUR_TELEGRAM_URL' with the actual URL
  await page.goto('https://web.telegram.org/a/', {
    waitUntil: 'domcontentloaded',
  })

  if (RUNNING_FIRST_TIME) {
    const tokenData = JSON.parse(await fs.readFile('tokken.json', 'utf-8'))

    // Set data in localStorage
    await page.evaluate((data) => {
      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value)
      }
    }, tokenData)
  }

  const screen = await page.evaluate(() => ({
    width: window.screen.availWidth,
    height: window.screen.availHeight - 100,
  }))
  await page.setViewport({ width: screen.width, height: screen.height })

  // -------------------------------------SEARCHBAR ID-------------------------------------------------

  await page.waitForSelector(SEARCH_BAR_ID)

  await delay(3000) // Wait for 1 second

  await page.type(SEARCH_BAR_ID, 'sneha')

  await delay(3000)

  // -------------------------------SELECTION OF SEARCHLIST----------------------------------------------

  await page.waitForSelector('.ListItem.chat-item-clickable.search-result') // Wait for the elements to load

  await delay(3000)

  // Select and click the first element with this class name
  const firstElement = await page.$(
    '.ListItem.chat-item-clickable.search-result'
  )
  if (firstElement) {
    await firstElement.click() // Perform the click action
  } else {
    console.log('No element found with the specified class name')
  }

  await delay(3000) // Wait for 1 second

  //   --------------------------------------------------JOIN CHANNEL-------------------------------------------------

  /*await page.waitForSelector('.Button.tiny.primary.fluid.has-ripple') // Wait for the button to appear
    await page.click('.Button.tiny.primary.fluid.has-ripple') // Click the button
  
    */

  /*----------------------------------------------CHAT-------------------------------------*/
  await startcoversation(page, chatSession)
  const lastMessageId = await waitForResponse(page)
  await delay(2000)
  let result = await sendMessageWithNextId(page, lastMessageId, chatSession)
  await delay(3000)
  while (result.isSuspect == 'Chatmore') {
    await delay(2000)
    const lastMessageId = await waitForResponse(page)
    await delay(2000)
    result = await sendMessageWithNextId(page, lastMessageId, chatSession)
  }

  console.log(result)
  // Uncomment this to pause the script for login (if needed)
  await new Promise(() => {})
})()

function incrementMessageId(messageId) {
  // Split the string into prefix and number
  const parts = messageId.split('-')
  const prefix = parts[0] // "message"
  const number = parseInt(parts[1], 10) // Convert the number part to an integer

  // Increment the number and return the new ID
  return `${prefix}-${number + 1}`
}

// Function to increment the message ID

async function sendMessageWithNextId(page, currentMessageId, chatSession) {
  const messageText = await page.evaluate((messageId) => {
    const getNextId = (messageId) => {
      const parts = messageId.split('-')
      const prefix = parts[0] // "message"
      const number = parseInt(parts[1], 10) // Convert the number part to an integer
      return `${prefix}-${number + 1}` // Increment and return the new ID
    }

    const nextMessageId = getNextId(messageId)
    const messageElement = document.querySelector(`#${nextMessageId}`)
    if (!messageElement) return null

    // Find the element containing the text
    const textContentElement = messageElement.querySelector('.text-content')
    return textContentElement
      ? textContentElement.childNodes[0].textContent.trim()
      : null
  }, currentMessageId)

  // send the gpt to get response
  const result = await chatSession.sendMessage(messageText)
  await page.type(
    '#editable-message-text',
    JSON.parse(result.response.text()).nextMessage
  )

  await page.waitForSelector(
    '.Button.send.main-button.default.secondary.round.click-allowed'
  )
  await page.click(
    '.Button.send.main-button.default.secondary.round.click-allowed'
  )
  let data = JSON.parse(result.response.text())
  return data
}

async function startcoversation(page, chatSession) {
  const inputField = await page.$('#editable-message-text')
  if (inputField) {
    console.log('Input field found! Sending message...')
    const result = await chatSession.sendMessage(`start ${LANGUAGE}`)

    await page.type(
      '#editable-message-text',
      JSON.parse(result.response.text()).nextMessage
    )

    // Optionally, click a send button (adjust the selector as needed)
    await page.waitForSelector(
      '.Button.send.main-button.default.secondary.round.click-allowed'
    )
    await page.click(
      '.Button.send.main-button.default.secondary.round.click-allowed'
    )
    console.log('Message sent!')
  } else {
    console.log('Input field not found.')
  }
  await delay(3000)
}

async function waitForResponse(page) {
  const lastMessageId = await page.evaluate(() => {
    // Get all elements with the class name "message-date-group"
    const messages = document.getElementsByClassName('message-date-group')

    // Get the last element in the list
    const listOfMessage = messages[messages.length - 1]

    // Get the ID of the last child
    return listOfMessage.lastChild.id // This assumes the last child has an ID
  })

  const nextId = incrementMessageId(lastMessageId)
  await page.waitForSelector(`#${nextId}`, {
    timeout: 86400000,
  })
  return lastMessageId
}
