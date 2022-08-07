import express from 'express';
import { getPlan, createPlan } from '../../controllers/services/plan.js';

const router = express.Router();

router.get('/', getPlan);
router.post('/', createPlan);

export default router;