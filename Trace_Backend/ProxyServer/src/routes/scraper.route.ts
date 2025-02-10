import express, { Router } from 'express';
import { sendToHighPriorityQueue } from '../module/queuing';
import { getResults } from '../module/scrapper/scrapper.controller';
const router: Router = express.Router();

router.post('/query',sendToHighPriorityQueue);
router.get('/result',getResults);
export default router;