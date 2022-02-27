import express from "express";
const router = express.Router();

import auth from '../middleware/auth.js';
import { signin, signup, updateUser, getUsers } from "../controllers/user.js";

router.get('/', getUsers);
router.post('/signin', signin);
router.post('/signup', signup);
router.patch('/profile/:id', auth, updateUser) 

export default router;