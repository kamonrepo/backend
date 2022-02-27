import express from 'express';
import mongoose from 'mongoose';
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

    const hostId = req._id;
     console.log('todayy-req: ', req.params);

   try {

        const brc = await BillRunCandidate.find({ host: hostId  });

        console.log('brc-find-resp: ', client);   
       
       res.status(200).json(client);

   } catch (error) {
       res.status(404).json({ message: error.message });
   }
}



export const createBillRunCandidate  = async (req, res) => {

    // const billrun = req.body;
    const temp = { 
        billRun: "09-15-2021",
        desc: "September 15, 2021",

    };

    const newBillRunCandidate = new BillRun(temp);
    try {

        await newBillRunCandidate.save();
        res.status(201).json(newBillRunCandidate);

    } catch (error) {
        console.log('server-controller-client-catch-error: ', error);
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