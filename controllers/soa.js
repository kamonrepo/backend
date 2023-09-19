import express from 'express';
import Soa from '../models/soa.js';

const router = express.Router();


export const getSoas = async (req, res) => {
    try {
        const getAllSoas = await Soa.find();
  
        res.status(200).json(getAllSoas);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const getSoaByBRCID = async (req, res) => {
    try {
        const SOA = await Soa.findById(req.body.id);

        res.status(200).json(SOA);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;