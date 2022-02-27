import express from 'express';

import { createClient, getClientGroupBy } from '../controllers/client.js';

const router = express.Router();

router.post('/', createClient);
router.get('/:group', getClientGroupBy);

export default router;