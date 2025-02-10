import config from "../config/config";
import { storeResult } from "../module/scrapper/scrapper.controller";
import WebSocket from "ws";

const ws = new WebSocket(config.TelegramScrapper);

ws.onopen = () => {
    console.log("Connected to Telegram Server");
};

ws.onmessage = async (event) => {
    // console.log("Recieved object");
    // return;
    try {
        let data: string;

        if (event.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = async () => {
                data = reader.result as string;
                processData(data);
            };
            reader.onerror = (error) => {
                console.error("Error reading Blob data:", error);
            };
            reader.readAsText(event.data);
        } else if (typeof event.data === 'string') {
            data = event.data;
            processData(data);
        } else {
            console.error("Unexpected message type:", typeof event.data);
        }

        async function processData(data: string) {
            try {
                const result = JSON.parse(data);
                if (Object.keys(result).length < 3 || !result["keyword"]) {
                    return;
                }
                if (result["messages analysis"]) {
                    result["messages analysis"] = JSON.parse(result["messages analysis"]);
                }
                if (result["logo description"]) {
                    result["logo description"] = JSON.parse(result["logo description"]);
                }
                if (Array.isArray(result["drug_messages"]) && result["drug_messages"].length === 0) {
                    delete result["drug_messages"];
                }
                console.log(result);
                await storeResult(result["keyword"], "telegram", result);
            } catch (error) {
                console.error("Error storing data :", error);
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


export const scrapeFromTelegram = (Keyword: string) => {
    try { ws.send(JSON.stringify({ keyword: Keyword })); }
    catch (error) {
        console.error("Error sending keyword to Server",error);
    }
}