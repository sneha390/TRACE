import mongoose from 'mongoose';
import app from './app';
import config from './config/config';
import logger from './module/logger/logger';
import amqp from 'amqplib';
import startWorker from './module/queuing';

let server: any;
console.log(config.mongoose.url)
mongoose.connect(config.mongoose.url).then(() => {
    logger.info('Connected to MongoDB');

    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
});
let channel: amqp.Channel | undefined;
let connection: amqp.Connection | undefined;
async function connectRabbitMQ() {
    connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    if (channel) {
        console.log("Yes channel");
        startWorker(channel);
    } else {
        console.log("No channel");
    }
    await channel.assertQueue('highPriorityQueue', { durable: true });
    await channel.assertQueue('lowPriorityQueue', { durable: true });
    return channel;
}
let channelPromise: Promise<amqp.Channel>;
channelPromise = connectRabbitMQ();
export default channelPromise;

const exitHandler = () => {
    
    if (server) {
        server.close(() => {
            logger.info('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

const unexpectedErrorHandler = (error: string) => {
    logger.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    if (server) {
        server.close();
    }
});

process.on('SIGINT', () => {
    logger.info('SIGINT received');
    if (server) {
        server.close();
    }
});



app.post('/scrape', async (req, res) => {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).send({ error: 'Keyword is required' });
    if (channel) {
        channel.sendToQueue('highPriorityQueue', Buffer.from(JSON.stringify({ keyword })));
        return res.send({ message: `Request for ${keyword} queued.` });
    }
    return res.status(500).send({ error: 'No channel found' });

});

