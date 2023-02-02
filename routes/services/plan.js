import express from 'express';
import { getPlan, createPlan, getPlanByCategoryId } from '../../controllers/services/plan.js';

const router = express.Router();

router.get('/', getPlan);
router.get('/:id', getPlanByCategoryId);
router.post('/', createPlan);

export default router;