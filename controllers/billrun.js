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
        mergedGroup: req.body.mergedGroup
    };

    console.log('createBillRun-reqModel::: ', reqModel);
    const newBillRun = new BillRun(reqModel);

    try {

        await newBillRun.save();

        let getGrpIds = []
        Object.keys(req.body.mergedGroup).forEach(key => {
            getGrpIds.push(req.body.mergedGroup[key].id);
        })

        let fetchActiveClients = await Client.find({ group:{ $in: getGrpIds }}); //and status is active
        let groupTotalMF = 0;

        for(let x = 0; x < fetchActiveClients.length; x++ ) {

            groupTotalMF = groupTotalMF + parseInt(fetchActiveClients[x].monthlyFee); 

            let newBillRunCandidate = new BillRunCandidate({
                host: newBillRun._id,
                client: fetchActiveClients[x]._id,
                name: fetchActiveClients[x].name,
                plan: fetchActiveClients[x].plan,
                planName: fetchActiveClients[x].planName,
                monthlyFee: fetchActiveClients[x].monthlyFee,
                paymentInfo: '---',
                status: '---'
        });
            await newBillRunCandidate.save();
        }

        let temp = await BillRun.findByIdAndUpdate(newBillRun._id, { total: groupTotalMF, unpaid: groupTotalMF });

        res.status(201).json(newBillRun);

    } catch (error) {
        console.log('createBillRun-error::: ', error.message);
        res.status(404).json({ message: error.message });
    }
}

export default router;