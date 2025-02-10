import config from "../config/config";
import { storeResult } from "../module/scrapper/scrapper.controller";
import WebSocket from "ws";

const ws = new WebSocket(config.TwitterScrapper);
ws.onopen = () => {
    console.log("Connected to Telegram Server");
};

ws.onmessage = async (event) => {
    try {
        let data: string;

        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = async () => {
                data = reader.result as string;
                await processResults(data);
            };
            reader.onerror = (error) => {
                console.error("Error reading Blob data:", error);
            };
            reader.readAsText(event.data);
        } else if (typeof event.data === 'string') {
            data = event.data;
            await processResults(data);
        } else {
            console.error("Unexpected message type:", typeof event.data);
        }

        async function processResults(data: string) {
            try {
                const result = JSON.parse(data);
                if (!result["results"]) {
                    return;
                }
                for (let res of result["results"]) {
                    await storeResult(result["keyword"], "twitter", res);
                }
            } catch (error) {
                console.error("Error processing results:", error);
            }
        }
    } catch (error) {
        console.error("Error in onmessage handler:", error);
    }
};


ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = () => {
    console.log("Connection closed");
};


export const scrapeFromTwitter = (Keyword: string) => {
    ws.send(JSON.stringify({ keyword: Keyword }));
}

