import express from 'express';
import { createBillRun, getBillrun } from '../controllers/billrun.js';

const router = express.Router();

router.post('/', createBillRun);
router.get('/', getBillrun);


export default router;