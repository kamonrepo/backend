import express from 'express';
import Client from '../models/client.js';

const router = express.Router();

export const createClient  = async (req, res) => {

    const client = req.body;

    const newClient = new Client(client);
    try {

        await newClient.save();
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