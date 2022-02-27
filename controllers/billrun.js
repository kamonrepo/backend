import express from 'express';
import BillRun from '../models/billrun.js';
import BillRunCandidate from '../models/billruncandidate.js';
import Client from '../models/client.js';
import Fawn from 'fawn';
import mongoose from 'mongoose';

const router = express.Router();
Fawn.init(mongoose);


export const getBillrun = async (req, res) => {
    try {
        const getAllBillRun = await BillRun.find();
  
        res.status(200).json(getAllBillRun);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  }


export const createBillRun  = async (req, res) => {

    const reqModel = { 
        billRun:  req.body.newWOs,
        mergedGroup: [req.body.groupName]
    };

    const newBillRun = new BillRun(reqModel);

    try {

        await newBillRun.save();
        const fetchActiveClients = await Client.find();

        //todo: 
             // add group obj on billrun model
            // fetch on billruncandidates 


        //create a loop 
        for(let x=0; x<fetchActiveClients.length; x++ ) {
            const newBillRunCandidate = new BillRunCandidate({
                host: newBillRun._id,
                client: fetchActiveClients[x]._id,
                name: fetchActiveClients[x].name,
                package: fetchActiveClients[x].package,
                monthlyFee: fetchActiveClients[x].monthlyFee,
                paymentInfo: '---',
                status: '---'
        });
            await newBillRunCandidate.save();
        }

        res.status(201).json(newBillRun);

        // fetch all the active clients
        // store it on billrunCandidate

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;