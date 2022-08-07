import express from 'express';
import { createCategory, getCategory } from '../../controllers/services/category.js';

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategory);

export default router;