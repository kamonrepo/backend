import express from 'express';
import BillRunCandidate from '../models/billruncandidate.js';
import BillRun from '../models/billrun.js';
import Payment from '../models/payment.js';

const router = express.Router();

export const getBillrunCandidate = async (req, res) => {
    try {
        const getAllBillRunCan = await BillRunCandidate.find();
  
        res.status(200).json(getAllBillRunCan);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const getBRCByBRId = async (req, res) => { 

   const hostId = req.params.id;

   try {

       console.log('backend-BillRunCandidate.find-by-host-brid-request:::: ', hostId); //todododododododododod
       const brcs = await BillRunCandidate.find({ host: hostId  });
       console.log('backend-BillRunCandidate.find-by-host-brid-BRC-LENGTH:::: ', brcs.length);
       console.log('backend-BillRunCandidate.find-by-host-brid-response:::: ', brcs);

       res.status(200).json(brcs);

   } catch (error) {
       res.status(404).json({ message: error.message });
   }
}

export const updateBRC = async (req, res) => {

    let updatedBr = null;

    if(req.body.isPaid == true){ // then update to UNPAID

       // console.log('updateBRC-UNPAID-req.body: ', req.body);

        let computeAboutToUnpaid = 0;
        let updatedBrUNPAID = null;

        for(let x in req.body.selectedIDs) {    
              let executeUnpaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: '---' });
              if(executeUnpaid){
                computeAboutToUnpaid = parseFloat(computeAboutToUnpaid) + parseFloat(req.body.selectedMFs[x]); 
              }
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
                    console.log('[UNPAID]-currentTotalUnpaid*** ', currentTotalUnpaid);
                    if(currentTotalPaid >= 0) {
                        console.log('[UNPAID]-currentTotalPaid**** ', currentTotalPaid);
                        computeLatestTotalPaid = parseFloat(currentTotalPaid) - parseFloat(computeAboutToUnpaid);
                        computeLatestTotalUnpaid = parseFloat(currentTotalUnpaid) + parseFloat(computeAboutToUnpaid);
                    }
                } 

                console.log('\n');     
                console.log(`[UNPAID]-computeLatestTotalPaid: ${currentTotalPaid} -  ${computeAboutToUnpaid} = ${computeLatestTotalPaid}`);   
                console.log('[UNPAID]-computeLatestTotalPaid::: ', computeLatestTotalPaid);   
                console.log('\n');
                console.log(`[UNPAID]-computeLatestTotalUnPaid: ${currentTotalUnpaid} +  ${computeAboutToUnpaid} = ${computeLatestTotalUnpaid}`);    
                console.log('[UNPAID]-computeLatestTotalUnPaid-typeof::: ', typeof(computeLatestTotalUnpaid));   
                console.log('[UNPAID]-computeLatestTotalUnPaid::: ', computeLatestTotalUnpaid);   
                console.log('[UNPAID]-BillRun.findByIdAndUpdate::: ', { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });     

                updatedBrUNPAID =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });
                updatedBr = updatedBrUNPAID;
                console.log('[UNPAID]-BillRun.findByIdAndUpdate::: ', { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid == 0 ? currentTotal : computeLatestTotalUnpaid});     
                updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid == 0 ? currentTotal : computeLatestTotalUnpaid });

    } else { //update to PAID
        console.log('updateBRC-PAID-req.body: ', req.body);

        let updatedBrPAID = null;
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
            computeLatestPaid = parseFloat(currentPaid) + parseFloat(computeAboutToPay);
            computeLatestUnpaid = parseFloat(currentUnpaid) - parseFloat(computeAboutToPay);
        } 
        
        if(currentPaid == 0){
            console.log('currentPaid == 0 ::: ', currentPaid);
                computeLatestPaid = computeAboutToPay;
                computeLatestUnpaid = parseFloat(currentUnpaid) - parseFloat(computeLatestPaid);
        } 

        console.log('\n');
        console.log(`[PAID]-computeLatestPaid: ${computeAboutToPay}`);   
        console.log('\n');
        console.log(`[PAID]-computeLatestUnPaid: ${currentUnpaid} -  ${computeLatestPaid} = ${computeLatestUnpaid}`);  
        console.log('[PAID]-computeLatestUnPaid::: ', computeLatestUnpaid);   
        console.log('[PAID]-await BillRun.findByIdAndUpdate',  { paid: computeLatestPaid, unpaid: computeLatestUnpaid  });
        updatedBrPAID =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid });
        updatedBr = updatedBrPAID;
        console.log('[PAID]-await BillRun.findByIdAndUpdate',  { paid: computeLatestPaid, unpaid: computeLatestUnpaid == 0 ? currentTotal : computeLatestUnpaid });
        updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid == 0 ? currentTotal : computeLatestUnpaid });
    }

    res.json(updatedBr);
}

export const createDefaultBRC  = async (req, res) => {

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
                dueDate: fetchActiveClients[x].dueDate,
                paymentDate: new Date(),
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