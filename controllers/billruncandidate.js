import express from 'express';
import BillRunCandidate from '../models/billruncandidate.js';

const router = express.Router();

export const getBillrunCandidate = async (req, res) => {
    try {
        const getAllBillRunCan = await BillRunCandidate.find();
  
        res.status(200).json(getAllBillRunCan);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getBRCById = async (req, res) => { 

    const hostId = req.params.id;

   try {

       const brcs = await BillRunCandidate.find({ host: hostId  });
       res.status(200).json(brcs);

   } catch (error) {
       res.status(404).json({ message: error.message });
   }
}

export const updateBRC = async (req, res) => {
    console.log('SERVERRRR----updateBRC-REQ.BODY::: ', req.body);

    for(let x in req.body) {
        console.log('heyy::: ', req.body[x]);
        await BillRunCandidate.findByIdAndUpdate(req.body[x], { status: 'PAID' });
    }

    res.json({isSuccess: true});
}

export default router;