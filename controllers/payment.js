import express from 'express';
import Payment from '../models/payment.js';
import AccumulatedPayment from '../models/accumulatedpayment.js';
import BillRunCandidate from '../models/billruncandidate.js';

const router = express.Router();

function getMonthNameFromDate(date) {
    const monthOptions = { month: 'long' };
    return date.toLocaleString('en-US', monthOptions);
}

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
        return `${getMonthNameFromDate(currentDate)} 15th`;
    } else if (currentDate >= sixteenthDayOfMonth && currentDate <= endDayOfMonth) {
        return `${getMonthNameFromDate(currentDate)} Endth`;
    } else {
        return 'unknown_period';
    }
}

function addOneMonth(dateString) {
    const [year, month] = dateString.split("-");
    const originalDate = new Date(year, parseInt(month) - 1); // JS months are 0-based
    originalDate.setMonth(originalDate.getMonth() + 1);
  
    const newYear = originalDate.getFullYear();
    const newMonth = (originalDate.getMonth() + 1).toString().padStart(2, "0");
  
    return `${newYear}-${newMonth}`;
}

async function appendBRC(data) {

    return await new Promise(resolve => {

        
        resolve(true);
    })
}

export const updatePayment = async (req, res) => {

    let updatedBr = null;

    if(req.body.isPaid == true){ // then update to UNPAID
        console.log('updatePayment-UPDATE-TO-UNPAID-req.body: ', req.body);
        console.log('updatePayment-UPDATE-TO-UNPAID-req.body.isPaid: ', req.body.isPaid);

        let brid = req.body.selectedBr;
        let totP = req.body.selectedMFs[0];
        const _selectedBr = await Payment.find({ billrun: brid });
        console.log('updatePayment-UPDATE-TO-UNPAID-selectedBr: ', typeof(_selectedBr));
        console.log('updatePayment-UPDATE-TO-UNPAID-selectedBr-length: ', _selectedBr.length);

    } else { 
        
        // update to PAID
        console.log('updatePayment-UPDATE-TO-PAID-req.body: ', req.body);
        console.log('updatePayment-UPDATE-TO-PAID-req.body.isPaid: ', req.body.isPaid);

        let brid = req.body.selectedBr;
        let brcId = req.body.selectedIDs[0];
        let totP = req.body.selectedMFs[0];
        let clientId = req.body.selectedBRCClient;
        let determinePeriod = determineMonthPeriod(new Date());

        const _getPaymentByBrid = await Payment.find({ billrun: brid }); 

        console.log('paymentpaymentpayment: ', _getPaymentByBrid[0]._id);
        console.log('brcIdbrcIdbrcIdbrcId: ', brcId);
        console.log('clientIdclientIdclientId: ', clientId[0]);

        // Check client record sa AccumulatedPayment
        const _getAccuPaymentByCriteria = await AccumulatedPayment.find({ payment: _getPaymentByBrid[0]._id, brc: brcId, client: clientId[0] }); 
        console.log('_getAccuPaymentByCriteria-lenghthththth: ', _getAccuPaymentByCriteria.length);
     
        if(_getAccuPaymentByCriteria.length !== 0) { //payment _id FOUND -> UPDATE by payment Id
            console.log('updatePayment-UPDATE-TO-PAID-payment-id-FOUND-_getAccuPaymentByCriteria: ', _getAccuPaymentByCriteria);

        } else  { // payment _id NOT_FOUND -> FIRST TIME CREATION of payment

            console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ', req.body);
            console.log('updatePayment-payment-id-NOT-FOUND, isPaid ', req.body.isPaid);

            //update BRC status by BRCID
            let executeStatusUpdate = null;

            try {

                executeStatusUpdate =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[0], { status: 'PAID', paymentDate: new Date() });

                if(executeStatusUpdate) 
                {
                    let paymentPayload = { 
                        billrun: brid,
                        totalPaid: totP, //todo:: dynamic computation -> fetch muna sa AccumulatedPayment via brcId -> then compute total
                        recentPaymentPeriod: 'latest payment via billrun id'
                    }
        
                    const firstTimePayment = new Payment(paymentPayload);
                    
                    try {
                    
                        await firstTimePayment.save();
                        if(firstTimePayment) {
        
                            let modeOpt = process.env.GCASH || 'MANUAL';
        
                            let paymentPayload = {
                                client: clientId,
                                brc: brcId,
                                payment: firstTimePayment._id,
                                period: determinePeriod,
                                paymentDate: new Date(),
                                mode: modeOpt,
                                amount: totP,
                                status: 'PAID'
                            }
        
                            let firstTimeAccumulatedPayment = new AccumulatedPayment(paymentPayload);
        
                            try {
        
                                firstTimeAccumulatedPayment.save();
        
                                if(firstTimeAccumulatedPayment) {
                                        try {
                                            const brcs = await BillRunCandidate.findById(brcId);
                                            if(brcs){
                                                console.log('brcs::: ', brcs);
                                                let currentMonthPeriod = brcs.monthPeriod; // string: YYYY-MM 
                                                let updatedMonthPeriod = addOneMonth(currentMonthPeriod);
        
                                                let payload = {
                                                    host: brid,
                                                    client: clientId,
                                                    name: brcs.name,
                                                    plan: brcs.plan,
                                                    planName: brcs.planName,
                                                    monthlyFee: brcs.monthlyFee,
                                                    dueDate: brcs.dueDate,
                                                    monthPeriod: updatedMonthPeriod, 
                                                    paymentDate: new Date(),
                                                    status: '---'
                                                }
        
                                                let newBillRunCandidate = new BillRunCandidate(payload);
        
                                                try{
        
                                                    newBillRunCandidate.save();
        
                                                } catch (error) {
                                                    console.log('catch-newBillRunCandidate.save()-error: ', error);
                                                    res.status(404).json({ message: error.message });
                                                }
                                            }
        
                                        } catch (error) {
                                            console.log('catch-BillRunCandidate-findbyId-error: ', error);
                                            res.status(404).json({ message: error.message });
                                        }
                                }
        
                            } catch(error) {
        
                                console.log('catch-AccumulatedPayment-error: ', error);
                                res.status(404).json({ message: error.message });
                            }
                        }
              
                    } catch (error) {
                        console.log('catch-Payment: ', error);
                        res.status(404).json({ message: error.message });
                    }

                }

            } catch(error) {
                console.log('catch-BillRunCandidate-findByIdAndUpdate-executeStatusUpdate: ', error);
                res.status(404).json({ message: error.message });
            }


        }

        //old
        // if(_getPaymentByBrid && _getPaymentByBrid.length !== 0) { //payment _id FOUND -> UPDATE by payment Id
        //     console.log('updatePayment-UPDATE-TO-PAID-payment-id-FOUND: ', _getPaymentByBrid[0]._id);

        // } else { // payment _id NOT_FOUND -> FIRST TIME CREATION of payment
        //     console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ', req.body);
        //     console.log('updatePayment-payment-id-NOT-FOUND, isPaid ', req.body.isPaid);

        //     //update BRC status by BRCID
        //     let executeStatusUpdate = null;

        //     try {

        //         executeStatusUpdate =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[0], { status: 'PAID', paymentDate: new Date() });

        //         if(executeStatusUpdate) 
        //         {
        //             let paymentPayload = { 
        //                 billrun: brid,
        //                 totalPaid: totP, //todo:: dynamic computation -> fetch muna sa AccumulatedPayment via brcId -> then compute total
        //                 recentPaymentPeriod: 'latest payment via billrun id'
        //             }
        
        //             const firstTimePayment = new Payment(paymentPayload);
                    
        //             try {
                    
        //                 await firstTimePayment.save();
        //                 if(firstTimePayment) {
        
        //                     let modeOpt = process.env.GCASH || 'MANUAL';
        
        //                     let paymentPayload = {
        //                         client: clientId,
        //                         brc: brcId,
        //                         payment: firstTimePayment._id,
        //                         period: determinePeriod,
        //                         paymentDate: new Date(),
        //                         mode: modeOpt,
        //                         amount: totP,
        //                         status: 'PAID'
        //                     }
        
        //                     let firstTimeAccumulatedPayment = new AccumulatedPayment(paymentPayload);
        
        //                     try {
        
        //                         firstTimeAccumulatedPayment.save();
        
        //                         if(firstTimeAccumulatedPayment) {
        //                                 try {
        //                                     const brcs = await BillRunCandidate.findById(brcId);
        //                                     if(brcs){
        //                                         console.log('brcs::: ', brcs);
        //                                         let currentMonthPeriod = brcs.monthPeriod; // string: YYYY-MM 
        //                                         let updatedMonthPeriod = addOneMonth(currentMonthPeriod);
        
        //                                         let payload = {
        //                                             host: brid,
        //                                             client: clientId,
        //                                             name: brcs.name,
        //                                             plan: brcs.plan,
        //                                             planName: brcs.planName,
        //                                             monthlyFee: brcs.monthlyFee,
        //                                             dueDate: brcs.dueDate,
        //                                             monthPeriod: updatedMonthPeriod, 
        //                                             paymentDate: new Date(),
        //                                             status: '---'
        //                                         }
        
        //                                         let newBillRunCandidate = new BillRunCandidate(payload);
        
        //                                         try{
        
        //                                             newBillRunCandidate.save();
        
        //                                         } catch (error) {
        //                                             console.log('catch-newBillRunCandidate.save()-error: ', error);
        //                                             res.status(404).json({ message: error.message });
        //                                         }
        //                                     }
        
        //                                 } catch (error) {
        //                                     console.log('catch-BillRunCandidate-findbyId-error: ', error);
        //                                     res.status(404).json({ message: error.message });
        //                                 }
        //                         }
        
        //                     } catch(error) {
        
        //                         console.log('catch-AccumulatedPayment-error: ', error);
        //                         res.status(404).json({ message: error.message });
        //                     }
        //                 }
              
        //             } catch (error) {
        //                 console.log('catch-Payment: ', error);
        //                 res.status(404).json({ message: error.message });
        //             }

        //         }

        //     } catch(error) {
        //         console.log('catch-BillRunCandidate-findByIdAndUpdate-executeStatusUpdate: ', error);
        //         res.status(404).json({ message: error.message });
        //     }


        // }
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