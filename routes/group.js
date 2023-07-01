import express from 'express';

import { createGroup, getGroups, createSubloc } from '../controllers/group.js';

const router = express.Router();

router.post('/', createGroup);
router.post('/subloc', createSubloc);
router.get('/', getGroups);

export default router;