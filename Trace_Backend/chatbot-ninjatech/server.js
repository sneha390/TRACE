import express from 'express';
import cors from 'cors';
import telegramRoutes from './telegramRoute.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', telegramRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Conversation Endpoints:`);
    console.log(`- POST http://localhost:${PORT}/api/telegram-chat`);
    console.log(`- GET http://localhost:${PORT}/api/conversation-history/:user_id`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    server.close(() => process.exit(0));
});

export default app;