import express from 'express';
import Payment from '../models/payment.js';
import AccumulatedPayment from '../models/accumulatedpayment.js';
import BillRunCandidate from '../models/billruncandidate.js';
import PostMessage from '../models/postMessage.js';
import Client from '../models/client.js';
import Soa from '../models/soa.js';
import Category from '../models/services/category.js';

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

function getFirstDayOfMonth(date) {
    // Create a new Date object with the same year and month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    
    const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour12: false, // Use 24-hour format
    timeZone: 'Asia/Manila',
   };
  
   const formattedDate = firstDayOfMonth.toLocaleString('en-US', options);
    
    return formattedDate;
} 

function formatDateManila(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Manila' };
    return date.toLocaleDateString('en-US', options);
}

export const updatePayment = async (req, res) => {

    let updatedPayments = null;

    try {

        if(req.body.isPaid == true) { // then update to UNPAID

            let brid = req.body.selectedBr;
            //let brcId = req.body.selectedIDs[0];
            //let toUnpaidFee = req.body.selectedMFs[0];
            let clientId = req.body.selectedBRCClient[0];
    
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
            //let clientName = req.body.selectedBr;
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
            
            else  { 
                 // payment _id NOT_FOUND -> FIRST TIME CREATION of payment 
                // console.log('updatePayment-payment-id-NOT-FOUND, FIRST TIME CREATION of payment ', req.body);
    
                //update BRC status by BRCID
                let executeStatusUpdate = null;
    
                try {
                    executeStatusUpdate =  await BillRunCandidate.findByIdAndUpdate(req.body.selectedIDs[0], { status: 'PAID', paymentDate: new Date() });
                      
                    if(executeStatusUpdate) {
                        console.log('BillRunCandidate update done');
    
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
                                                    let currentMonthPeriod = brcs.monthPeriod; // string: Eg. 10-1-2023
                                                    let updatedMonthPeriod = addOneMonth(currentMonthPeriod);

                                                    let sharedValue = addOneMonth(getFirstDayOfMonth(new Date()));

                                                    let mfData = { period: sharedValue, amount: brcs.monthlyFee }
            
                                                    let payload = {
                                                        host: brid,
                                                        client: clientId,
                                                        name: brcs.name,
                                                        plan: brcs.plan,
                                                        planName: brcs.planName,
                                                        monthlyFee: [],
                                                        dueDate: brcs.dueDate,
                                                        monthPeriod: updatedMonthPeriod, 
                                                        paymentDate: formatDateManila(new Date()),
                                                        status: 'NOTPAID'
                                                    }
            
                                                    let newBillRunCandidate = new BillRunCandidate(payload);

                                                    newBillRunCandidate.monthlyFee.push(mfData);
                                                    try {
            
                                                        newBillRunCandidate.save();
                                                        console.log('BillRunCandidate save done');
                    
                                                        if(newBillRunCandidate) {

                                                            //fetch account no on client model
                                                            let cl = await Client.findById(clientId);
                                                            let serviceCateg = await Category.findById(cl.category);

                                                            try {
                                                            //generate report
                                                            let discount = 0; //tododo ? san trigger ng discount ? prior payment ? 
                                                            let subTotal = parseFloat(newBillRunCandidate.monthlyFee);
                                                            let computeTATP = subTotal - parseFloat(discount);

                                                            let buildPayload = {
                                                                body: {
                                                                    clientName: cl.name,
                                                                    clientAddress: cl.address,
                                                                    contactNumber: cl.contactNumber,
                                                                    accountNumber: cl.accountNumber,
                                                                    accountStatus: cl.status,
                                                                    planName:  brcs.planName,
                                                                    statementDate: newBillRunCandidate.paymentDate,
                                                                    billingReferenceNo: 'todo',
                                                                    type: serviceCateg.category,
                                                                    descriptions: 'N/A',
                                                                    paymentOption: firstTimeAccumulatedPayment.mode,
                                                                    subTotal: subTotal,
                                                                    totalAmtToPay: computeTATP
                                                                }
                                                            };

                                                            // let generateBase64 = await generate(buildPayload);
                                                            let generateBase64 = await generate(buildPayload);

                                                             if(generateBase64) {                                                               
                                                                    //upsert on postMessage
                                        
                                                                    let postMessageContent = {
                                                                        title: cl.accountNumber,
                                                                        message: "PAID",
                                                                        owner: req.body.userFullname,
                                                                        creator: req.body.userFullname,
                                                                        monthPeriod: getFirstDayOfMonth(new Date()),
                                                                        selectedFile: 'todo'
                                                                    }
                                        
                                                                    let newPostMessage = new PostMessage({ ...postMessageContent, createdAt: new Date().toISOString() });
                                                                
                                                                    try {
                                                                        
                                                                        await newPostMessage.save();
                                                                        console.log('PostMessage create done ', newPostMessage._id); 

                                                                        let soaContent = {
                                                                            brcid: brcId,
                                                                            pmsgid: newPostMessage._id,
                                                                            client: clientId,
                                                                            dueDate: brcs.dueDate,
                                                                            monthPeriod: getFirstDayOfMonth(new Date()),
                                                                            paymentDate: new Date(),
                                                                            mode: 'MANUAL',
                                                                            fileId: `JPEG-${Date.now()}`,
                                                                            filename: generateBase64.fileName,
                                                                            filepath: generateBase64.filePath
                                                                        }

                                                                        let newSoa = new Soa({ ...soaContent, createdAt: new Date().toISOString() });

                                                                        try {
                                                                            await newSoa.save();
                                                                            console.log('SOA create success!');

                                                                        } catch (error) {
                                                                            console.log('SOA upsert error: ', error);
                                                                            res.status(404).json({ message: error.message });
                                                                        }

                                                                        updatedPayments = { isSuccess: true, doneUpsert: 'MODEL-SUCCES-UPSET-DB-BRC-ACCPYT-PMSG-SOA' };

                                                                    } catch (error) {
                                                                        console.log('PostMessage upsert error: ', error);
                                                                        res.status(404).json({ message: error.message });
                                                                    }
                                                             }

                                                            } catch(error) {
                                                                console.log('generateBase64 error: ', error);
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