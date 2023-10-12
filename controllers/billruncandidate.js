import express from 'express';
import BillRunCandidate from '../models/billruncandidate.js';
import BillRun from '../models/billrun.js';

const router = express.Router();

function getCurrentMonthPeriod(date) {

    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    let formattedDate = `${year}-${month}`;

    //resume sa line 22

    return formattedDate;
}

export const computeFees = async (req, res) => { 
    try {
        console.log('computeFees started');

        const paidAggregation = await BillRunCandidate.aggregate([
            {
              $match: {
                $and: [
                  {
                    status: "PAID",
                  },
                  {
                    $expr: {
                      $lte: [
                        {
                          $toDate: "$monthPeriod",
                        },
                        {
                          $dateFromParts: {
                            year: {
                              $year: new Date(),
                            },
                            month: {
                              $month: new Date(),
                            },
                            day: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $group: {
                _id: "$host",
                totalPaidSum: {
                  $sum: {
                    $toDouble: "$monthlyFee",
                  },
                },
                totalPaidClients: { $sum: 1 }
              },
            },
        ]);

        // Calculate total sum of monthlyFee WHERE status="NOTPAID" and group by host
        const notPaidAggregation = await BillRunCandidate.aggregate([
            {
              $match: {
                $and: [
                  {
                    status: "NOTPAID",
                  },
                  {
                    $expr: {
                      $lte: [
                        {
                          $toDate: "$monthPeriod",
                        },
                        {
                          $dateFromParts: {
                            year: {
                              $year: new Date(),
                            },
                            month: {
                              $month: new Date(),
                            },
                            day: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $group: {
                _id: "$host",
                totalNotPaidSum: {
                  $sum: {
                    $toDouble: "$monthlyFee",
                  },
                },
                totalUnpaidClients: { $sum: 1 }
              },
            },
        ]);
  
        // Get bill run names
        const billRunNames = await BillRun.aggregate([
           {
              $project: {
                 _id: 0,
                 host: "$_id",
                 billRun: 1
              }
           }
        ]);
  
        // Combine the results into a single object
        const result = billRunNames.map(item => ({
           host: item.host,
           billRun: item.billRun,
           totalPaidSum: (paidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalPaidSum: 0 }).totalPaidSum,
           totalNotPaidSum: (notPaidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalNotPaidSum: 0 }).totalNotPaidSum,
           totalPaidClients: (paidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalPaidClients: 0 }).totalPaidClients,
           totalUnpaidClients: (notPaidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalUnpaidClients: 0 }).totalUnpaidClients,
        }));
  
        res.status(200).json(result);
     } catch (error) {
        res.status(500).json({ message: error.message });
     }
}
 
export const getBillrunCandidate = async (req, res) => {
    try {
        const getAllBillRunCan = await BillRunCandidate.find();
  
        res.status(200).json(getAllBillRunCan);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// function getMonthNameFromDate(date) {
//     const monthOptions = { month: 'long' };
//     return date.toLocaleString('en-US', monthOptions);
// }

// function determineMonthPeriod(currentDate) {

//     // First day of the current month
//     let firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
//     // 15th day of the current month
//     let fifteenthDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 15);
//     // 16th day of the current month
//     let sixteenthDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 16);
//     // End day of the current month (last day of the next month minus one day)
//     let endDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

//     if (currentDate >= firstDayOfMonth && currentDate <= fifteenthDayOfMonth) {
//         console.log('currentDate::: ', currentDate); 
//         return currentDate;
//     } else if (currentDate >= sixteenthDayOfMonth && currentDate <= endDayOfMonth) {
//         console.log('currentDate::: ', currentDate); 
//         return currentDate;
//     } else {
//         console.log('unknown_period::: ', currentDate); 
//         return 'unknown_period';
//     }
// }

export const getBRCByBRId = async (req, res) => { 

   const hostId = req.params.id;

   try {

       //console.log('todo:::: ', hostId); //todododododododododod check client if status active
       const brcs = await BillRunCandidate.find({ host: hostId });
       console.log('brcs:::: ', brcs.length);

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

export const createBRC  = async (req, res) => {

    try {
        console.log('createBRCPostman-req-body::: ', req.body);

        let newBillRunCandidate = new BillRunCandidate({
            host: '651a7a82ae6a990e20c191b2',
            client: '652646b23a2465212c008329',
            name: 'Newnewnew',
            plan: '65010f9e7aeb1b200c9f8ee3',
            planName: 'Starlink',
            monthlyFee: '3333',
            dueDate: 'Endth',
            monthPeriod: '09/01/2023',
            status: 'NOTPAID'
        });

        await newBillRunCandidate.save();
        res.status(201).json(newBillRunCandidate);
    }

    catch (error) {

        console.log('server-controller-client-catch-error: ', error);
        res.status(404).json({ message: error.message });
    }
}

export default router;