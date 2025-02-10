import amqp from 'amqplib';
import { Request, Response } from 'express';
import { catchAsync } from '../../util';
import * as webSockets from '../../websockets';
import channelPromise from '../..';
// import { channel } from 'diagnostics_channel';

const performScraping = async (keyword: string) => {
    console.log(`Scrapping data for ${keyword}...`);
    try { webSockets.scrapeFromTelegram(keyword); }
    catch(err){
        console.error(`Error sending ${keyword}: `,err)
    }
    // webSockets.scrapeFromTwitter(keyword);
}

const startWorker = async (channel: amqp.Channel | undefined) => {
    console.log('Waiting for messages...');
    if (!channel) {
        console.log("No channel found! Consumer stopped");
        return;
    }
    while (true) {
        let keyword = await channel.get('highPriorityQueue', { noAck: false });
        if (keyword) {
            console.log(`Doing work on ${keyword}`)
            performScraping(keyword.content.toString());
            channel.ack(keyword);
            continue;
        }

        keyword = await channel.get('lowPriorityQueue', { noAck: false });
        if (keyword) {
            performScraping(keyword.content.toString());
            channel.ack(keyword);
        } else {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Pause if no messages
        }
        console.log("Nothin found");
    }
    console.log('Worker started');
}

export const sendToHighPriorityQueue = catchAsync(async (req: Request, res: Response) => {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).send({ error: 'Keyword is required' });
    const channel = await channelPromise;
    if (!channel) {
        return res.status(500).send({ error: 'No channel found' });
    }
    channel.assertQueue('highPriorityQueue', { durable: true });
    channel.sendToQueue('highPriorityQueue', Buffer.from(JSON.stringify({ keyword })));
    return res.send({ message: `Request for ${keyword} queued.` });

});

export const sendToLowPriorityQueue = catchAsync(async (keyword: string) => {
    if (!keyword) return;
    channelPromise.then(channel => {
        channel.assertQueue('lowPriorityQueue', { durable: true });
        channel.sendToQueue('lowPriorityQueue', Buffer.from(keyword));
    });
});
export default startWorker;