import express from 'express';
import Soa from '../models/soa.js';

const router = express.Router();

export const getSoaById = async (req, res) => {
    try {
        const SOA = await Soa.findById(req.body.id);

        res.status(200).json(SOA);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;