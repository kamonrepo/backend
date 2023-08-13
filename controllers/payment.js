import express from 'express';
import Payment from '../models/payment.js';
import AccumulatedPayment from '../models/accumulatedpayment.js';

const router = express.Router();

function determineMonthPeriod(currentDate) {

    // First day of the current month
    let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    // 15th day of the current month
    let fifteenthDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
    // 16th day of the current month
    let sixteenthDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
    // End day of the current month (last day of the next month minus one day)
    let endDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    if (currentDate >= firstDayOfMonth && currentDate <= fifteenthDayOfMonth) {
        return '15th';
    } else if (currentDate >= sixteenthDayOfMonth && currentDate <= endDayOfMonth) {
        return 'Endth';
    } else {
        return 'unknown_period';
    }
}

export const updatePayment = async (req, res) => {

    let updatedBr = null;

    if(req.body.isPaid == true){ // then update to UNPAID
        console.log('updatePayment-UNPAID-req.body: ', req.body);
      
        let brid = req.body.selectedBr;
        let totP = req.body.selectedMFs[0];
        const _selectedBr = await Payment.find({ billrun: brid});
        console.log('updatePayment-selectedBr: ', typeof(_selectedBr));
        console.log('updatePayment-selectedBr-length: ', _selectedBr.length);

    } else { 
        
        // update to PAID
        console.log('updatePayment-PAID-req.body: ', req.body);

        let brid = req.body.selectedBr;
        let brcId = req.body.selectedIDs[0];
        let totP = req.body.selectedMFs[0];
        let clientId = req.body.selectedBRCClient;
        let determinePeriod = determineMonthPeriod(new Date());

        const _getPaymentByBrid = await Payment.find({ billrun: brid });

        if(_getPaymentByBrid && _getPaymentByBrid.length !== 0) { //payment _id FOUND
            console.log('updatePayment-payment-id-FOUND: ', _getPaymentByBrid[0]._id);

        } else { // payment _id NOT_FOUND
            console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ',req.body);

            let paymentPayload = { 
                billrun: brid,
                totalPaid: totP,
                recentPaymentPeriod: 'latest payment via billrun id'
            }

            const newPayment = new Payment(paymentPayload);
            
            try {
                await newPayment.save();
                if(newPayment) {

                    let modeOpt = process.env.GCASH || 'MANUAL';

                    let paymentPayload = {
                        client: clientId,
                        brc: brcId,
                        payment: newPayment._id,
                        period: determinePeriod,
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

export const getAccumulatedPayments  = async (req, res) => {

    try {
        const getAllAccumulatedPayments = await AccumulatedPayment.find();
        res.status(200).json(getAllAccumulatedPayments);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
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