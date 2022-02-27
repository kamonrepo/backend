import express from 'express';
import {  getBillrunCandidate, updateBRC, getBRCById } from '../controllers/billruncandidate.js';

const router = express.Router();
    router.get('/', getBillrunCandidate);
    router.get('/:id', getBRCById);
    router.patch('/updateBRC', updateBRC);

export default router;