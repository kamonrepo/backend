import express from 'express';
import { getSoaByPMSGID, getSoas } from '../controllers/soa.js';

const router = express.Router();

router.get('/', getSoas);
router.get('/:id', getSoaByPMSGID);

export default router;