import express from 'express';
import Targetlocation from '../models/targetlocation.js';

const router = express.Router();

export const createTargetlocation = async (req, res) => {
    const targetlocation = req.body;
    const newTargetlocation = new Targetlocation(targetlocation);
    try {

        await newTargetlocation.save();
         res.status(200).json(newTargetlocation);

    } catch (error) {
        console.log('catch-createTargetlocation: ', error);
        res.status(404).json({ message: error });
    }
}

export const getTargetLocations = async (req, res) => {
    try {
        const getAllTargetlocations = await Targetlocation.find();
  
        res.status(200).json(getAllTargetlocations);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;