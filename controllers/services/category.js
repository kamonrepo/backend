import express from 'express';
import Category from '../../models/services/category.js';

const router = express.Router();

export const createCategory  = async (req, res) => {

    try {
        console.log('reqreqreqreq::: ', req.body);
        const category = new Category(req.body);
        await category.save();

        res.status(200).json(category);

    } catch (error) {
        console.log('errrr::: ', error.message);
        res.status(404).json({ message: error.message });
    }
}

export const getCategory = async (req, res) => {
    try {
        const category = await Category.find();

        res.status(200).json(category);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  }

export default router;