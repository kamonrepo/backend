import express from 'express';
import Client from '../models/client.js';
import BillRunCandidate from '../models/billruncandidate.js';
import BillRun from '../models/billrun.js';

const router = express.Router();

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

const generateAccountNo = () => {
    return 1;
}

export const createClient  = async (req, res) => {

    const client = req.body;

    const newClient = new Client({...client, accountNumber: generateAccountNo()});
    try {

        await newClient.save();

        let fetchBr = await BillRun.find({ targetlocId: client.targetlocId });
        let bridHost = fetchBr[0]._id;

        let newBillRunCandidate = new BillRunCandidate({
            host: bridHost,
            client: newClient._id,
            name: client.name,
            plan: client.plan,
            planName: client.planName,
            monthlyFee: client.monthlyFee,
            dueDate: client.dueDate,
            monthPeriod: getFirstDayOfMonth(new Date()),
            status: 'NOTPAID'
        });
        
        await newBillRunCandidate.save();

        if(newBillRunCandidate) {
            console.log('newBillRunCandidate has been save: ', newBillRunCandidate);
        }

        res.status(201).json(newClient);

    } catch (error) {
        console.log('server-controller-client-catch-error: ', error);
        res.status(404).json({ message: error.message });
    }
}

export const getClientGroupBy = async (req, res) => { 

    const { group } = req.params;
    console.log('todayy-req: ', req.params);

    try {
        const client = await Client.find({ group: group  });
        console.log('todayy-resp: ', client);   
        
        res.status(200).json(client);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;