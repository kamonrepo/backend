import express from 'express';
import BillRunCandidate from '../models/billruncandidate.js';
import BillRun from '../models/billrun.js';

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

    if(req.body.isPaid == true){

        let totalPaid = 0;
        for(let x in req.body.selectedIDs) {
            
            // let executeUnpaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: '---' });
            // console.log('executeUnpaid::: ', executeUnpaid);
            // if BillRunCandidate is success; update billrun next
            //apply the total upon billrun creation
            //fetch total from billrun collection using brid
            //fetch stauts of selectedIDs use as reference if paid/unpaid

           console.log('updateBRC-unpaid-selectedIDs',req.body.selectedIDs[x]);
        }
    } else {

        let computeAboutToPay = 0;
        for(let x in req.body.selectedIDs) {
            // let executePaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: 'PAID' });
            // console.log('executePaid::: ', executePaid);

            console.log('updateBRC-paid-selectedIDs',req.body.selectedIDs[x]);
            console.log('updateBRC-paid-selectedMFs', req.body.selectedMFs[x]);

            computeAboutToPay = computeAboutToPay + parseInt(req.body.selectedMFs[x]); 

        }

        //fetch total from billrun collection using brid
        const brMonthlyFee = await BillRun.find({ _id: req.body.selectedBr})

        let currentTotal = brMonthlyFee.total;
        let currentPaid = brMonthlyFee.paid;
        let currentUnpaid = brMonthlyFee.unpaid;

        //total = un
         


    


    }

    res.json({isSuccess: true});
}

export default router;