import express from 'express';
import { generate, getDataLocation } from '../../controllers/report/generate.js';

const router = express.Router();
router.post('/', generate);
router.get('/getDataLocation', getDataLocation);

export default router;