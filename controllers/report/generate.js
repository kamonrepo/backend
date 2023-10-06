import express from 'express';
import template from '../report/templates/index.js';
import dataLocTemplate from '../report/templates/dataloc.js';
import BillRunCandidate from '../../models/billruncandidate.js';
import BillRun from '../../models/billrun.js';
import Client from '../../models/client.js';

const router = express.Router();

const generateDoc = async (reqBody, res) => {
    try {

        let base64 = await template(reqBody);
        return base64; 
    }
    catch(e) {
        return e;
    }

}

export const generate = async (req, res) => {
    try {

        console.log('generateDoc-req: ', req.body);
        let ret = await generateDoc(req.body)

        return ret;
    } catch (error) {
       return { message: error.message };
    }
};

const generateDataLoc = async (payload, res) => {
    try {

        let base64 = await dataLocTemplate(payload);
        return base64; 
    }
    catch(e) {
        return e;
    }

}

export const getDataLocation = async (req, res) => { 
    try {

        console.log('getDataLocation started');
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


         let holdPaidAggregation = paidAggregation;

        // Combine the results into a single object
        const result = billRunNames.map((item, index) => ({
           host: item.host,
           billRun: item.billRun,
           totalPaidSum: (paidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalPaidSum: 0 }).totalPaidSum,
           totalNotPaidSum: (notPaidAggregation.find(aggregation => aggregation._id.equals(item.host)) || { totalNotPaidSum: 0 }).totalNotPaidSum,

        }));

        console.log('DOES this result::: ', result);
        console.log('--include::: ', holdPaidAggregation);

        let updatedPayload = {};

        Object.keys(result).forEach((index) => {
          //console.log('result.objectKeys::: ', result[index]);
        });

        //console.log('updatedPayload-bottom::: ', updatedPayload);

        let base64 = await generateDataLoc({mainData: req.body, rptParam: result})

        res.status(200).json(base64);
     } catch (error) {
        res.status(500).json({ message: error.message });
     }
}

export default router;
