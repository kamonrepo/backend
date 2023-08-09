import express from 'express';

import { createPayment, getPayments, updatePayment } from '../controllers/payment.js';

const router = express.Router();

router.get('/', getPayments);
router.post('/', createPayment);
router.patch('/updatePayment', updatePayment);

export default router;