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

    if(req.body.isPaid == true){ // then update to unpaid
        let computeAboutToUnpaid = 0;

        for(let x in req.body.selectedIDs) {
            //  let executeUnpaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: '---' });

            console.log('brc findByIdAndUpdate status to unpaid: ', req.body.selectedIDs[x]);

            computeAboutToUnpaid = parseFloat(computeAboutToUnpaid) + parseFloat(req.body.selectedMFs[x]); 
        }               
                //fetch total from billrun collection using brid
                const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

                let currentTotalUnpaid = parseFloat(selectedBr[0].unpaid); 
                let currentTotalPaid = parseFloat(selectedBr[0].paid); 

                console.log('START-----------------------------------------------');  

                console.log('compute-about-to-unpaid::: ', computeAboutToUnpaid);       
                console.log('-----------------------------------------------');       
                console.log('current-total-unpaid::: ', currentTotalUnpaid);     
                console.log('current-total-paid::: ', currentTotalPaid);       
                console.log('-----------------------------------------------');       
                console.log('\n');       

                let computeLatestTotalPaid = 0;
                let computeLatestTotalUnpaid = 0;
        
                if(currentTotalUnpaid >= 0) {

                    if(currentTotalPaid >= 0) {
                        computeLatestTotalPaid = currentTotalPaid + computeAboutToUnpaid;
                        computeLatestTotalUnpaid = currentTotalUnpaid - computeAboutToUnpaid;
                    }
                }
                //   let updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });
                //   console.log('[unpaid]-billrun-model-update-resp::: ', updatedBr); 

                console.log('updatedBr-id::: ', req.body.selectedBr);       
                console.log('paid::: ', computeLatestTotalPaid);       
                console.log('unpaid::: ', computeLatestTotalUnpaid);
    } else {

        let computeAboutToPay = 0;

        for(let x in req.body.selectedIDs) {
            //  let executePaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: 'PAID' });
             computeAboutToPay = parseFloat(computeAboutToPay) + parseFloat(req.body.selectedMFs[x]); 
        }

        //before the update of BillRun, get the existing value of fee's
        const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

        let currentTotal = parseFloat(selectedBr[0].total);
        let currentPaid = parseFloat(selectedBr[0].paid); 
        
        let computeLatestPaid = 0;
        let computeLatestUnpaid = 0;

        if(currentPaid !== 0) {

            computeLatestPaid = currentPaid + computeAboutToPay;
            computeLatestUnpaid = currentTotal - computeLatestPaid;

        } else if(currentPaid == 0){

            computeLatestPaid = computeAboutToPay;
            computeLatestUnpaid = currentTotal - computeLatestPaid;
        } else {

        }

         let updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid });
        //  console.log('[paid]-billrun-model-update-resp::: ', updatedBr);        

    }

    res.json({ isSuccess: true });
}

export default router;