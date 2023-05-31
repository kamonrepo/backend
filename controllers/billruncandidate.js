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

    let updatedBr = null;

    if(req.body.isPaid == true){ // then update to UNPAID
        console.log('************************************UNPAID-UNPAID-UNPAID');
        let computeAboutToUnpaid = 0;

        for(let x in req.body.selectedIDs) {
            
            //   let executeUnpaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: '---' });
              computeAboutToUnpaid = parseFloat(computeAboutToUnpaid) + parseFloat(req.body.selectedMFs[x]); 
        }               
                //fetch total from billrun collection using brid
                const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

                let currentTotal = parseFloat(selectedBr[0].total);
                let currentTotalUnpaid = parseFloat(selectedBr[0].unpaid); 
                let currentTotalPaid = parseFloat(selectedBr[0].paid); 

                console.log('************************************');
                console.log('***AboutToUnpaid::: ', computeAboutToUnpaid);
                console.log('currentTotal::: ', currentTotal);
                console.log('currentTotalUnpaid::: ', currentTotalUnpaid);
                console.log('currentTotalPaid::: ', currentTotalPaid);
                console.log('************************************');
          

                let computeLatestTotalPaid = 0;
                let computeLatestTotalUnpaid = 0;
        
                if(currentTotalUnpaid >= 0) {
                    console.log('currentTotalUnpaid*** ', currentTotalUnpaid);
                    if(currentTotalPaid >= 0) {
                        computeLatestTotalPaid = currentTotalPaid - computeAboutToUnpaid;
                        computeLatestTotalUnpaid = currentTotalUnpaid + computeAboutToUnpaid;
                    }
                } 

                // if(currentTotalUnpaid == 0) {
                //     console.log('currentTotalUnpaid*** ', currentTotalUnpaid);
                //     computeLatestTotalPaid = currentTotalPaid + computeAboutToUnpaid;
                //     computeLatestTotalUnpaid = currentTotalUnpaid - computeAboutToUnpaid;                    
                // }
                console.log('\n');     
                console.log('computeLatestTotalPaid::: ',computeLatestTotalPaid);    
                console.log('computeLatestTotalUnpaid::: ',computeLatestTotalUnpaid);   
                console.log('\n');             
                console.log('BillRun.findByIdAndUpdate::: ', { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });     
        // updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });

    } else { //update to PAID
        console.log('************************************PAID-PAID-PAID');
        let computeAboutToPay = 0;

        for(let x in req.body.selectedIDs) {
              let executePaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: 'PAID' });
             computeAboutToPay = parseFloat(computeAboutToPay) + parseFloat(req.body.selectedMFs[x]); 
        }

        //before the update of BillRun, get the existing value of fee's
        const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

        let currentTotal = parseFloat(selectedBr[0].total);
        let currentPaid = parseFloat(selectedBr[0].paid); 
        let currentUnpaid = parseFloat(selectedBr[0].unpaid); 

        console.log('\n');     
        console.log('\n');     
        console.log('************************************');
        console.log('***AboutToPay::: ', computeAboutToPay);
        console.log('currentTotal::: ', currentTotal);
        console.log('currentPaid::: ', currentPaid);
        console.log('currentUnpaid::: ', currentUnpaid);
        console.log('************************************');

        let computeLatestPaid = 0;
        let computeLatestUnpaid = 0;

        if(currentPaid != 0) {
            console.log('currentPaid != 0 ::: ', currentPaid);
            computeLatestPaid = currentPaid + computeAboutToPay;
            computeLatestUnpaid = currentUnpaid - computeLatestPaid;
        } 
        
     if(currentPaid == 0){
        console.log('currentPaid == 0 ::: ', currentPaid);
            computeLatestPaid = computeAboutToPay;
            computeLatestUnpaid = currentUnpaid - computeLatestPaid;


        } 

        console.log('\n');     
        console.log('await BillRun.findByIdAndUpdate',  { paid: computeLatestPaid, unpaid: computeLatestUnpaid });
        updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid });
        //  console.log('[paid]-billrun-model-update-resp::: ', updatedBr);        

    }

    res.json(updatedBr);
}

export default router;