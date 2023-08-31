import express from 'express';
import {  getBillrunCandidate, updateBRC, getBRCByBRId, computeFees } from '../controllers/billruncandidate.js';

const router = express.Router();
    router.get('/', getBillrunCandidate);
    router.get('/computeFees', computeFees);
    router.get('/:id', getBRCByBRId);
    router.patch('/updateBRC', updateBRC);

export default router;