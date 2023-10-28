import express from 'express';
import { checkLatestBRC, getBillrunCandidate, updateBRC, getBRCByBRId, getBRCByMonthPeriod,computeFees, createBRC } from '../controllers/billruncandidate.js';

const router = express.Router();
    router.post('/', createBRC);
    router.get('/', getBillrunCandidate);
    router.get('/computeFees', computeFees);
    router.get('/:id', getBRCByBRId);
    router.post('/monthPeriod', getBRCByMonthPeriod);
    router.post('/checklatestbrc', checkLatestBRC);
    router.patch('/updateBRC', updateBRC);

export default router;