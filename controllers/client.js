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


function AccountNoUniqueTimeStamp(date) { // example: "09142023202404"
    
    // Get month, day, year, hours, minutes, and seconds
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    let day = date.getDate().toString().padStart(2, '0');
    let year = date.getFullYear().toString();

    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');

    // Concatenate and return the formatted string
    return `${month}${day}${year}${hours}${minutes}${seconds}`;
}

const generateAccountNo = ipaddr => {

    let octets = ipaddr.split('.');

    // Get the 3rd and 4th octet
    let thirdOctet = octets[2];
    let fourthOctet = octets[3];
    let withDash = thirdOctet + '-' + fourthOctet;

    let accountNo = "GST-" + AccountNoUniqueTimeStamp(new Date()) + '-' + withDash;

    console.log('return account number::: ', accountNo.toUpperCase());

    return accountNo.toUpperCase();
}

export const createClient  = async (req, res) => {

    const client = req.body;

    let tlname = req.body.targetloc;
    let myCode = tlname.substring(0, 3); //get the first 3 char

    const newClient = new Client({...client, accountNumber: generateAccountNo(req.body.ipaddr), targetlocCode: myCode.toUpperCase()});
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
            monthPeriod: addOneMonth(getFirstDayOfMonth(new Date())),
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