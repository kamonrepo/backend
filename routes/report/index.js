import express from 'express';
import { generate } from '../../controllers/report/generate.js';

const router = express.Router();
router.post('/', generate);

export default router;