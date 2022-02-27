import express from 'express';

import { createLocation, getLocations } from '../controllers/location.js';

const router = express.Router();

router.post('/', createLocation);
router.get('/', getLocations);

export default router;