import express from 'express';
import {  getBillrunCandidate, updateBRC, getBRCByBRId } from '../controllers/billruncandidate.js';

const router = express.Router();
    router.get('/', getBillrunCandidate);
    router.get('/:id', getBRCByBRId);
    router.patch('/updateBRC', updateBRC);

export default router;