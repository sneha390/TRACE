import { Request, Response } from 'express';
import { catchAsync } from "../../util/";
import * as scrapperService from './scrapper.service';

export const getResults = catchAsync(async (req: Request, res: Response) => {
    const keyword = Array.isArray(req.query["keyword"])
        ? req.query["keyword"][0]
        : (req.query["keyword"] as string | undefined);
    const platform = Array.isArray(req.query["platform"])
        ? req.query["platform"][0]
        : (req.query["platform"] as string | undefined);

    const start = Array.isArray(req.query["start"])
        ? req.query["start"][0]
        : (req.query["start"] as string | undefined);

    if (!keyword || !start) {
        return res.status(400).json({ error: 'Invalid or missing parameters' });
    }
    try {
        const results = await scrapperService.getResults(keyword as string, platform as string, start as string);
        return res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while fetching results' });
    }
});

export const storeResult = scrapperService.storeResult;