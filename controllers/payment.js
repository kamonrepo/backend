import express from 'express';
import Payment from '../models/payment.js';
import AccumulatedPayment from '../models/accumulatedpayment.js';
import BillRunCandidate from '../models/billruncandidate.js';
import PostMessage from '../models/postMessage.js';

import { generate } from '../controllers/report/generate.js';

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

// function addOneMonth(dateString) {
//     const [year, month] = dateString.split("-");
//     const originalDate = new Date(year, parseInt(month) - 1); // JS months are 0-based
//     originalDate.setMonth(originalDate.getMonth() + 1);
  
//     const newYear = originalDate.getFullYear();
//     const newMonth = (originalDate.getMonth() + 1).toString().padStart(2, "0");
  
//     return `${newYear}-${newMonth}`;
// }

function addOneMonth(dateString) {
    // Parse the input date string
    const parts = dateString.split('/');
    const month = parseInt(parts[0], 10) - 1; // Months are 0-indexed in JavaScript
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
  
    // Create a Date object and add one month
    const date = new Date(year, month + 1, day);
  
    // Get the new month, day, and year
    const newMonth = date.getMonth() + 1; // Adding 1 to convert back to 1-indexed month
    const newDay = date.getDate();
    const newYear = date.getFullYear();
  
    // Format the output string
    const formattedDate = `${newMonth.toString().padStart(2, '0')}/${newDay.toString().padStart(2, '0')}/${newYear}`;
  
    return formattedDate;
}

async function findAndUpdateByBRC(brcId, newStatus) {
    try {
        // Find the document with the provided brcId and update the status field
        const updatedPayment = await AccumulatedPayment.findOneAndUpdate(
            { brc: brcId },
            { $set: { status: newStatus, paymentDate: new Date() } },
            { new: true } // To return the updated document
        );

       // console.log('return updatedPayment:', updatedPayment);
        return updatedPayment;

    } catch (error) {
        console.log('findAndUpdateByBRC-catch-Error:', error);
        return error;
    }
}

export const updatePayment = async (req, res) => {

    let updatedPayments = null;

    try {

        if(req.body.isPaid == true) { // then update to UNPAID

            let brid = req.body.selectedBr;
            let brcId = req.body.selectedIDs[0];
            let toUnpaidFee = req.body.selectedMFs[0];
            let clientId = req.body.selectedBRCClient[0];
            let determinePeriod = determineMonthPeriod(new Date());
    
            const _getPaymentBy_BRID_CLIENT_ID = await Payment.find({ billrun: brid, client: clientId }); 
            if(_getPaymentBy_BRID_CLIENT_ID.length !== 0) { //payment _id FOUND -> UPDATE by payment Id
    
            //update BRC status by BRCID
            let executeStatusUpdate = null;
    
            try {
                executeStatusUpdate =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[0], { status: 'NOTPAID', paymentDate: new Date() });
    
                if(executeStatusUpdate) {
                    let updatedAccumulatedPayment = null;
            
                    try {
                       
                        //todoo: findAndUpdate by FK
                        updatedAccumulatedPayment = await findAndUpdateByBRC(req.body.selectedIDs[0], 'NOTPAID');
    
                        if(updatedAccumulatedPayment){
                            console.log('updatedAccumulatedPayment::: ', updatedAccumulatedPayment);
    
                        } else {
                            console.log('UPDATE_ACCUMULATED_PAYMENT_TO_UNPAID-findAndUpdateByBRC-FAIL::: ', updatedAccumulatedPayment);
                        }
    
                    } catch(error) {
                        console.log('catch-AccumulatedPayment-UPDATE_TO_UNPAID: ', error);
                        res.status(404).json({ message: error.message });
                    }
                }
    
            } catch (error) {
    
                console.log('catch-BillRunCandidate-UPDATE_TO_UNPAID: ', error);
                res.status(404).json({ message: error.message });
            }
    
            } else { 
                console.log('no way ma punta here kasi, sure na meron ng payment ito kasi mag a-unpaid sya, therefore nag bayad na sya. babawwin nya lang. ');
            }
    
        } 

        else {  // update to PAID
                 
              //console.log('updatePayment-UPDATE-TO-PAID-req.body: ', req.body);
    
            let brid = req.body.selectedBr;
            let brcId = req.body.selectedIDs[0];
            let totP = req.body.selectedMFs[0];
            let clientId = req.body.selectedBRCClient[0];
            let determinePeriod = determineMonthPeriod(new Date());
    
            const _getPaymentBy_BRID_CLIENT_ID = await Payment.find({ billrun: brid, client: clientId }); 
    
            if(_getPaymentBy_BRID_CLIENT_ID.length !== 0) { //payment _id FOUND -> UPDATE by payment Id
                //add safety validation here if BRC status is UNPAID -> then updatye sa PAID
                //console.log('scenario: ma pa find ko ung BRC na nag UNPAID then mag PAID ulit ngayon, nag ka record na sya Payments, update PAID status lang ulit', _getPaymentBy_BRID_CLIENT_ID);
    
                let executeStatusUpdateBRC = null;
    
                try {
                    executeStatusUpdateBRC =  await BillRunCandidate.findByIdAndUpdate(brcId, { status: 'PAID', paymentDate: new Date() });
    
                    if(executeStatusUpdateBRC) {
                        
                        let executeStatusUpdateACCUPYT = null;
    
                        try { //update by brc
    
                            executeStatusUpdateACCUPYT = await findAndUpdateByBRC(brcId, 'PAID');
    
                            if(executeStatusUpdateACCUPYT) {
                            } else {
                            }
    
                        } catch(error) {
                            console.log('catch-AccumulatedPayment-UPDATE-TO-PAID-findByIdAndUpdate-error: ', error);
                            res.status(404).json({ message: error.message });
                        }
                    }
    
                } catch(error) {
                    console.log('catch-BillRunCandidate-UPDATE-TO-PAID-findByIdAndUpdate-error: ', error);
                    res.status(404).json({ message: error.message });
                }
    
            }
            
            else  { // payment _id NOT_FOUND -> FIRST TIME CREATION of payment 
    
               // console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ', req.body);
    
                //update BRC status by BRCID
                let executeStatusUpdate = null;
    
                try {
                    executeStatusUpdate =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[0], { status: 'PAID', paymentDate: new Date() });
    
                    if(executeStatusUpdate) {
    
                        let paymentPayload = { 
                            billrun: brid,
                            client: clientId,
                            recentPaymentPeriod: 'latest PAID month period on accumulated payment - fetch via billrun id'
                        }
            
                        const firstTimePayment = new Payment(paymentPayload);
                        
                        try {
                            await firstTimePayment.save();
                            if(firstTimePayment) {
            
                                let modeOpt = process.env.GCASH || 'MANUAL';
            
                                let paymentPayload = {
                                    client: clientId,
                                    brc: brcId,
                                    brid: brid,
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
                                                        status: 'NOTPAID'
                                                    }
            
                                                    let newBillRunCandidate = new BillRunCandidate(payload);
            
                                                    try {
            
                                                        newBillRunCandidate.save();
    
                    
                                                        if(newBillRunCandidate) {
    
                                                            // //generate report
                                                            // let buildPayload = {
                                                            //     body: {
                                                            //         header: "GSTECH-LOGO",
                                                            //         name: clientId,
                                                            //         accountNumber: "GST-0001",
                                                            //         planName:  brcs.planName
                                                            //     }
                                                            // };
                                                            // let generateBase64 = await generate(buildPayload);
                                                            // if(generateBase64) {}
    
                                                            //upsert on postMessage
                                
                                                                let postMessageContent = {
                                                                    title: "Account Number",
                                                                    message: "PAID",
                                                                    owner: req.body.userFullname,
                                                                    creator: req.body.userFullname,
                                                                    monthPeriod: "todo"
                                                                }
                                       
                                                                let newPostMessage = new PostMessage({ ...postMessageContent, createdAt: new Date().toISOString() });

                                                            
                                                                try {
                                                                    await newPostMessage.save();
                                                                    console.log('PostMessage done create: ', newPostMessage);

                                                                    updatedPayments = { isSuccess: true, doneUpsert: 'BRC-ACCPYT-PMSG' };
    
                                                                } catch (error) {
                                                                    console.log('PostMessage upsert error: ', error);
                                                                    res.status(404).json({ message: error.message });
                                                                }
    
                                                            
    
                                                        }
            
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
        }
    
        res.status(200).json(updatedPayments);

    } catch(error) {
        console.log('PARENT-TRY-CATCH-ERROR: ', error);
        res.status(404).json({ message: error.message });
    }
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