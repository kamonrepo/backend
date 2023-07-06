import express from 'express';

import { createGroup, getGroups, getSublocs, createSubloc, createTargetLoc } from '../controllers/group.js';

const router = express.Router();

router.post('/', createGroup);
router.post('/subloc', createSubloc);
router.get('/', getGroups);
router.get('/get/sublocs', getSublocs);
router.post('/targetloc', createTargetLoc);

export default router;