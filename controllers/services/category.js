import express from 'express';
import Category from '../../models/services/category.js';
import  mongoose  from "mongoose";

const router = express.Router();

export const createCategory  = async (req, res) => {

    try {
    console.log('createCategory-reqBodee::: ', req.body);
    let typeParam = req.body.type;


        if(typeParam == 'create') {
            //create new
            let newCategory = new Category({ category: req.body.service});
            await newCategory.save();
            console.log('new category saved::: ', newCategory);
            res.status(200).json(newCategory);

        } else {
            //update existing 
            let id = req.body.category;
            let updatedService = {category: req.body.service};
            if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);


            let updatedCategory = await Category.findByIdAndUpdate(id, updatedService);
            console.log('category updated::: ', updatedCategory);
            await updatedCategory.save();
            res.status(200).json(updatedCategory);
        }

    } catch (error) {
        console.log('createCategory-errrr::: ', error);
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