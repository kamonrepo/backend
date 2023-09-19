import express from 'express';
import { getSoa } from '../controllers/soa.js';

const router = express.Router();

router.get('/', getSoa);
// router.post('/', createGroup);

export default router;