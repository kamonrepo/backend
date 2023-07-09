import express from 'express';

import { createGroup, getGroups, getSublocs, getTargetlocs, createSubloc, createTargetLoc } from '../controllers/group.js';

const router = express.Router();

router.get('/', getGroups);
router.get('/get/sublocs', getSublocs);
router.get('/get/targetlocs', getTargetlocs);

router.post('/', createGroup);
router.post('/subloc', createSubloc);
router.post('/targetloc', createTargetLoc);

export default router;