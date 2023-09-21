import express from 'express';
import { getSoaByBRCID, getSoas } from '../controllers/soa.js';

const router = express.Router();

router.get('/', getSoas);
router.get('/:id', getSoaByBRCID);

export default router;