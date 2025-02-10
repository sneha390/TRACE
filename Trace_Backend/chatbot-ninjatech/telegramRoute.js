import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import TelegramChatbot from './telegramChatbot.js';

const router = express.Router();

// Conversation history file path
const HISTORY_FILE_PATH = path.resolve('./conversation_histories.json');

/**
 * Read existing conversation histories from file
 * @returns {Promise<Object>} Existing conversation histories
 */
async function readConversationHistories() {
    try {
        const fileContent = await fs.readFile(HISTORY_FILE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        // If file doesn't exist, return empty object
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

/**
 * Save conversation history to file
 * @param {Object} histories - Updated conversation histories
 */
async function saveConversationHistories(histories) {
    await fs.writeFile(
        HISTORY_FILE_PATH,
        JSON.stringify(histories, null, 2),
        'utf-8'
    );
}

/**
 * Telegram Chatbot Conversation Endpoint
 */
router.post('/telegram-chat', async (req, res) => {
    try {
        // Validate input
        const {
            user_id,
            language = 'English',
            firstTime = false
        } = req.body;

        // Validate required parameters
        if (!user_id) {
            return res.status(400).json({
                error: 'user_id is required'
            });
        }

        // Create chatbot instance
        const chatbot = new TelegramChatbot({
            searchQuery: user_id,
            language: language,
            runningFirstTime: firstTime
        });

        // Start conversation and get results
        const response = await chatbot.startConversationLoop();

        // Read existing histories
        const existingHistories = await readConversationHistories();

        // Add new conversation history
        existingHistories[user_id] = {
            timestamp: new Date().toISOString(),
            language,
            firstTime,
            history: response.chats,
            isSuspect: response.isSuspect
        };

        // Save updated histories
        await saveConversationHistories(existingHistories);

        // Respond with conversation details
        res.json({
            success: true,
            user_id,
            language,
            firstTime,
            isSuspect: response.isSuspect,
        });

    } catch (error) {
        console.error('Telegram Chat Error:', error);
        res.status(500).json({
            error: 'Failed to complete Telegram conversation',
            details: error.message
        });
    }
});

/**
 * Retrieve conversation history for a specific user
 */
router.get('/conversation-history/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;

        // Read existing histories
        const existingHistories = await readConversationHistories();

        // Check if history exists for the user
        const userHistory = existingHistories[user_id];
        if (!userHistory) {
            return res.status(404).json({
                error: 'No conversation history found for this user'
            });
        }

        res.json(userHistory);

    } catch (error) {
        console.error('Retrieve History Error:', error);
        res.status(500).json({
            error: 'Failed to retrieve conversation history',
            details: error.message
        });
    }
});

export default router;