import express from 'express';
import Payment from '../models/payment.js';
import AccumulatedPayment from '../models/accumulatedpayment.js';

const router = express.Router();

export const updatePayment = async (req, res) => {

    let updatedBr = null;

    if(req.body.isPaid == true){ // then update to UNPAID
        console.log('updatePayment-UNPAID-req.body: ', req.body);
      
        let brid = req.body.selectedBr;
        let totP = req.body.selectedMFs[0];
        const _selectedBr = await Payment.find({ billrun: brid});
        console.log('updatePayment-selectedBr: ', typeof(_selectedBr));
        console.log('updatePayment-selectedBr-length: ', _selectedBr.length);


        // let currentTotal = parseFloat(selectedBr[0].total);
        
        // let paymentExists = Payment.findById(brid, async (err, document) => {

        //     if (err) {
        //       console.error('An error occurred:', err);
        //     } else if (document) {
        //       console.log('Document found:', document);
        //     } else {
        //       console.log('Payment I not found, create new::: ', req.body);

        //     //   const paymentSchema = mongoose.Schema({
        //     //     billrun: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
        //     //     total: { type: String, default: '0' },
        //     //     paid: { type: String, default: '0' },
        //     //     unpaid: { type: String, default: '0' },
        //     //     status: { type: String },
        //     //     createdAt: {
        //     //         type: Date,
        //     //         default: new Date()
        //     //     }
        //     // })

        //     // let paymentPayload = { 
        //     //     billrun: brid,
              
        //     // }

        //     // const newPayment = new Payment(paymentPayload);
            
        //     // try {

        //     //     await newPayment.save();
        //     //     res.status(200).json(newPayment);
        
        //     // } catch (error) {
        //     //     console.log('catch-createPayment: ', error);
        //     //     res.status(404).json({ message: error.message });
        //     // }


        //     }
        //   });

          //console.log('paymentExists::: ', paymentExists);

        // console.log('isPaymentExists: ', isPaymentExists);
       // console.log('updatePayment-brid: ', brid);
        // console.log('updatePayment-isPaymentExists: ', isPaymentExists);
            
        //       let executeUnpaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: '---' });

        //       if(executeUnpaid){
        //         computeAboutToUnpaid = parseFloat(computeAboutToUnpaid) + parseFloat(req.body.selectedMFs[x]); 
        //       }
              
        // }               
        //         //fetch total from billrun collection using brid
        //         const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

        //         let currentTotal = parseFloat(selectedBr[0].total);
        //         let currentTotalUnpaid = parseFloat(selectedBr[0].unpaid); 
        //         let currentTotalPaid = parseFloat(selectedBr[0].paid); 

        //         console.log('************************************');
        //         console.log('***AboutToUnpaid::: ', computeAboutToUnpaid);
        //         console.log('currentTotal::: ', currentTotal);
        //         console.log('currentTotalUnpaid::: ', currentTotalUnpaid);
        //         console.log('currentTotalPaid::: ', currentTotalPaid);
        //         console.log('************************************');
          
        //         let computeLatestTotalPaid = 0;
        //         let computeLatestTotalUnpaid = 0;
        
        //         if(currentTotalUnpaid >= 0) {
        //             console.log('[UNPAID]-currentTotalUnpaid*** ', currentTotalUnpaid);
        //             if(currentTotalPaid >= 0) {
        //                 console.log('[UNPAID]-currentTotalPaid**** ', currentTotalPaid);
        //                 computeLatestTotalPaid = parseFloat(currentTotalPaid) - parseFloat(computeAboutToUnpaid);
        //                 computeLatestTotalUnpaid = parseFloat(currentTotalUnpaid) + parseFloat(computeAboutToUnpaid);
        //             }
        //         } 

        //         console.log('\n');     
        //         console.log(`[UNPAID]-computeLatestTotalPaid: ${currentTotalPaid} -  ${computeAboutToUnpaid} = ${computeLatestTotalPaid}`);   
        //         console.log('[UNPAID]-computeLatestTotalPaid::: ', computeLatestTotalPaid);   
        //         console.log('\n');
        //         console.log(`[UNPAID]-computeLatestTotalUnPaid: ${currentTotalUnpaid} +  ${computeAboutToUnpaid} = ${computeLatestTotalUnpaid}`);    
        //         console.log('[UNPAID]-computeLatestTotalUnPaid-typeof::: ', typeof(computeLatestTotalUnpaid));   
        //         console.log('[UNPAID]-computeLatestTotalUnPaid::: ', computeLatestTotalUnpaid);   
        //         console.log('[UNPAID]-BillRun.findByIdAndUpdate::: ', { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });     

        //         updatedBrUNPAID =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid });
        //         updatedBr = updatedBrUNPAID;
                // console.log('[UNPAID]-BillRun.findByIdAndUpdate::: ', { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid == 0 ? currentTotal : computeLatestTotalUnpaid});     
                // updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestTotalPaid, unpaid: computeLatestTotalUnpaid == 0 ? currentTotal : computeLatestTotalUnpaid });

    } else { 
        
        // update to PAID
        console.log('updatePayment-PAID-req.body: ', req.body);

        let brid = req.body.selectedBr;
        let totP = req.body.selectedMFs[0];
        let clientId = req.body.selectedBRCClient;

        const _getPaymentByBrid = await Payment.find({ billrun: brid });


        if(_getPaymentByBrid && _getPaymentByBrid.length !== 0) { //payment _id FOUND
            console.log('updatePayment-payment-id-FOUND: ', _getPaymentByBrid[0]._id);

        } else { // payment _id NOT_FOUND
            console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ',req.body);

            let paymentPayload = { 
                billrun: brid,
                totalPaid: totP,
                recentPaymentPeriod: 'todo: get period (15th/Endth) dynamically depending on current day'
            }

            const newPayment = new Payment(paymentPayload);
            
            try {

                await newPayment.save();
                if(newPayment) {

                    let modeOpt = process.env.GCASH || 'MANUAL';

                    let paymentPayload = {
                        client: clientId,
                        payment: newPayment._id,
                        period: '',
                        mode: modeOpt,
                        amount: totP,
                        status: 'PAID'
                    }

                    let newAccumulatedPayment = new AccumulatedPayment(paymentPayload);

                    try{

                        newAccumulatedPayment.save();
                    } catch(error) {

                        console.log('catch-AccumulatedPayment-error: ', error);
                        res.status(404).json({ message: error.message });
                    }
                }
      
            } catch (error) {
                console.log('catch-createPayment: ', error);
                res.status(404).json({ message: error.message });
            }
        }

    // let executePaid =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[x], { status: 'PAID' });
        //      computeAboutToPay = parseFloat(computeAboutToPay) + parseFloat(req.body.selectedMFs[x]); 
        // }

        //before the update of BillRun, get the existing value of fee's
        // const selectedBr = await BillRun.find({ _id: req.body.selectedBr });

        // let currentTotal = parseFloat(selectedBr[0].total);
        // let currentPaid = parseFloat(selectedBr[0].paid); 
        // let currentUnpaid = parseFloat(selectedBr[0].unpaid); 

        // console.log('************************************');
        // console.log('***AboutToPay::: ', computeAboutToPay);
        // console.log('currentTotal::: ', currentTotal);
        // console.log('currentPaid::: ', currentPaid);
        // console.log('currentUnpaid::: ', currentUnpaid);
        // console.log('************************************');

        // let computeLatestPaid = 0;
        // let computeLatestUnpaid = 0;

        // if(currentPaid != 0) {
        //     console.log('currentPaid != 0 ::: ', currentPaid);
        //     computeLatestPaid = parseFloat(currentPaid) + parseFloat(computeAboutToPay);
        //     computeLatestUnpaid = parseFloat(currentUnpaid) - parseFloat(computeAboutToPay);
        // } 
        
        // if(currentPaid == 0){
        //     console.log('currentPaid == 0 ::: ', currentPaid);
        //         computeLatestPaid = computeAboutToPay;
        //         computeLatestUnpaid = parseFloat(currentUnpaid) - parseFloat(computeLatestPaid);
        // } 

        // console.log('\n');
        // console.log(`[PAID]-computeLatestPaid: ${computeAboutToPay}`);   
        // console.log('\n');
        // console.log(`[PAID]-computeLatestUnPaid: ${currentUnpaid} -  ${computeLatestPaid} = ${computeLatestUnpaid}`);  
        // console.log('[PAID]-computeLatestUnPaid::: ', computeLatestUnpaid);   
        // console.log('[PAID]-await BillRun.findByIdAndUpdate',  { paid: computeLatestPaid, unpaid: computeLatestUnpaid  });
        // updatedBrPAID =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid });
        // updatedBr = updatedBrPAID;
        // console.log('[PAID]-await BillRun.findByIdAndUpdate',  { paid: computeLatestPaid, unpaid: computeLatestUnpaid == 0 ? currentTotal : computeLatestUnpaid });
        // updatedBr =  await BillRun.findByIdAndUpdate(req.body.selectedBr, { paid: computeLatestPaid, unpaid: computeLatestUnpaid == 0 ? currentTotal : computeLatestUnpaid });
    }

    res.json(updatedBr);
}


export const getPayments = async (req, res) => {
    try {

        const getAllPayments = await Payment.find();
  
        res.status(200).json(getAllPayments);

    } catch (error) {

        res.status(404).json({ message: error.message });
    }
}

export const createPayment  = async (req, res) => {

    const payment = req.body;

    console.log('createGroup-payment-req: ', payment);
    const newPayment = new Payment(payment);

    try {

        await newPayment.save();
        res.status(201).json(newPayment);

    } catch (error) {
        console.log('server-controller-payment-catch-error: ', error);
        res.status(404).json({ message: error.message });
    }
}


export default router;