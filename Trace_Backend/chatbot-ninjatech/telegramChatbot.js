import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import { model, generationConfig } from './chatbot.js';

class TelegramChatbot {
    constructor(options = {}) {
        this.SEARCH_BAR_ID = '#telegram-search-input';
        this.CLICKABLE_RESULT_SELECTOR = '.ListItem.chat-item-clickable.search-result';
        this.INPUT_SELECTOR = '#editable-message-text';
        this.SEND_BUTTON_SELECTOR = '.Button.send.main-button.default.secondary.round.click-allowed';

        this.options = {
            runningFirstTime: true,
            language: 'English',
            searchQuery: '',
            ...options
        };
    }

    /**
     * Create a delay promise
     * @param {number} ms - Milliseconds to delay
     * @returns {Promise}
     */
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Increment a message ID
     * @param {string} messageId - Current message ID
     * @returns {string} Next message ID
     */
    static incrementMessageId(messageId) {
        const [prefix, number] = messageId.split('-');
        return `${prefix}-${parseInt(number, 10) + 1}`;
    }

    /**
     * Initialize browser and Telegram web
     * @returns {Promise<{browser: Browser, page: Page, chatSession: ChatSession}>}
     */
    async initialize() {
        // Launch browser
        const browser = await puppeteer.launch({
            headless: false,
            userDataDir: './user_data',
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        // Set up screen dimensions
        const screen = await page.evaluate(() => ({
            width: window.screen.availWidth,
            height: window.screen.availHeight - 100
        }));
        await page.setViewport({ width: screen.width, height: screen.height });

        // Navigate to Telegram web
        await page.goto('https://web.telegram.org/a/', {
            waitUntil: 'domcontentloaded'
        });

        // Handle first-time token setup
        if (this.options.runningFirstTime) {
            await this.setupLocalStorage(page);
        }

        // Start chat session
        const chatSession = model.startChat({
            generationConfig,
            history: []
        });

        return { browser, page, chatSession };
    }

    /**
     * Setup local storage with token data
     * @param {Page} page - Puppeteer page instance
     */
    async setupLocalStorage(page) {
        try {
            const tokenData = JSON.parse(await fs.readFile('tokken.json', 'utf-8'));
            await page.evaluate((data) => {
                for (const [key, value] of Object.entries(data)) {
                    localStorage.setItem(key, value);
                }
            }, tokenData);
        } catch (error) {
            console.error('Error setting up local storage:', error);
        }
    }

    /**
     * Search and select a chat
     * @param {Page} page - Puppeteer page instance
     * @param {string} searchQuery - Chat/user to search for
     */
    async selectChat(page, searchQuery) {
        await page.waitForSelector(this.SEARCH_BAR_ID);
        await TelegramChatbot.delay(1000);

        await page.click(this.SEARCH_BAR_ID);

        await page.evaluate((text) => {
            document.querySelector('#telegram-search-input').value = text;
        }, searchQuery);

        await page.waitForSelector(this.CLICKABLE_RESULT_SELECTOR);
        await TelegramChatbot.delay(3000);

        const firstElement = await page.$(this.CLICKABLE_RESULT_SELECTOR);
        if (firstElement) {
            await firstElement.click();
        } else {
            console.log('No chat found with the specified search query');
        }

        await TelegramChatbot.delay(3000);
    }

    /**
     * Start conversation with AI
     * @param {Page} page - Puppeteer page instance
     * @param {ChatSession} chatSession - AI chat session
     */
    async startConversation(page, chatSession) {
        const inputField = await page.$(this.INPUT_SELECTOR);
        if (!inputField) {
            console.log('Input field not found.');
            return;
        }

        console.log('Input field found! Sending initial message...');
        const result = await chatSession.sendMessage(`start ${this.options.language}`);
        const initialMessage = JSON.parse(result.response.text()).nextMessage;

        await page.type(this.INPUT_SELECTOR, initialMessage);
        await page.waitForSelector(this.SEND_BUTTON_SELECTOR);
        await page.click(this.SEND_BUTTON_SELECTOR);

        console.log('Initial message sent!');
        await TelegramChatbot.delay(3000);
    }

    /**
     * Wait for and retrieve last message ID
     * @param {Page} page - Puppeteer page instance
     * @returns {Promise<string>} Last message ID
     */
    async waitForResponse(page) {
        const lastMessageId = await page.evaluate(() => {
            const messages = document.getElementsByClassName('message-date-group');
            const listOfMessage = messages[messages.length - 1];
            return listOfMessage.lastChild.id;
        });

        const nextId = TelegramChatbot.incrementMessageId(lastMessageId);
        await page.waitForSelector(`#${nextId}`, { timeout: 86400000 });
        return lastMessageId;
    }

    /**
     * Send message with AI-generated response
     * @param {Page} page - Puppeteer page instance
     * @param {string} currentMessageId - Current message ID
     * @param {ChatSession} chatSession - AI chat session
     * @returns {Promise<Object>} Result from AI
     */
    async sendMessageWithNextId(page, currentMessageId, chatSession) {
        const messageText = await page.evaluate((messageId) => {
            console.log('Current message ID:', messageId);
            const nextMessageId = messageId.split('-').map((part, index) =>
                index === 1 ? `${parseInt(part, 10) + 1}` : part
            ).join('-');
            console.log('Next message ID:', nextMessageId);
            const messageElement = document.querySelector(`#${nextMessageId}`);
            if (!messageElement) return null;
            console.log('Message element:', messageElement);
            const textContentElement = messageElement.querySelector('.text-content');
            console.log('Text content element:', textContentElement);
            return textContentElement ? textContentElement.childNodes[0].textContent.trim() : null;
        }, currentMessageId);

        const result = await chatSession.sendMessage(messageText);
        const responseData = JSON.parse(result.response.text());

        await page.type(this.INPUT_SELECTOR, responseData.nextMessage);
        await page.waitForSelector(this.SEND_BUTTON_SELECTOR);
        await page.click(this.SEND_BUTTON_SELECTOR);

        return responseData;
    }

    /**
     * Main conversation loop
     * @param {Object} options - Conversation options
     */
    async startConversationLoop(options = {}) {
        const mergedOptions = { ...this.options, ...options };
        const { browser, page, chatSession } = await this.initialize();

        try {
            await this.selectChat(page, mergedOptions.searchQuery);
            await this.startConversation(page, chatSession);

            let lastMessageId = await this.waitForResponse(page);
            await TelegramChatbot.delay(2000);
            console.log('Last message ID:', lastMessageId);

            let result = await this.sendMessageWithNextId(page, lastMessageId, chatSession);
            await TelegramChatbot.delay(3000);

            while (result.isSuspect.toLowerCase() === 'chatmore') {
                await TelegramChatbot.delay(2000);
                lastMessageId = await this.waitForResponse(page);
                await TelegramChatbot.delay(2000);
                result = await this.sendMessageWithNextId(page, lastMessageId, chatSession);
            }

            return {
                isSuspect: result.isSuspect,
                chats: chatSession.params.history
            }
        } catch (error) {
            console.error('Error in conversation loop:', error);
        } finally {
            // Uncomment to keep browser open indefinitely
            // await new Promise(() => {});
            await browser.close();
        }
    }
}

// // Example usage
// (async () => {
//     const chatbot = new TelegramChatbot({
//         searchQuery: 'Aashu_katiyar446',
//         language: 'English',
//         runningFirstTime: true
//     });

//     let result = await chatbot.startConversationLoop();
// })();

export default TelegramChatbot;
