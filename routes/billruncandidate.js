import express from 'express';
import {  getBillrunCandidate, updateBRC, getBRCByBRId, computeFees, createBRC } from '../controllers/billruncandidate.js';

const router = express.Router();
    router.post('/', createBRC);
    router.get('/', getBillrunCandidate);
    router.get('/computeFees', computeFees);
    router.get('/:id', getBRCByBRId);
    router.patch('/updateBRC', updateBRC);

export default router;