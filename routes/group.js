import express from 'express';

import { createGroup, getGroups, getSublocs, createSubloc, createTargetLoc } from '../controllers/group.js';

const router = express.Router();

router.get('/', getGroups);
router.get('/get/sublocs', getSublocs);

router.post('/', createGroup);
router.post('/subloc', createSubloc);
router.post('/targetloc', createTargetLoc);

export default router;