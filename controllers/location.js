import express from 'express';
import Location from '../models/location.js';

const router = express.Router();

export const createLocation  = async (req, res) => {
    const location = req.body;

    const newLocation = new Location(location);
    try {

        await newLocation.save();
        console.log('server-controller-location-try')
        res.status(201).json(newLocation);

    } catch (error) {
        console.log('server-controller-location-catch-error: ', error);
        res.status(404).json({ message: error.message });
    }
}

export const getLocations = async (req, res) => {
    try {
        const getAllLocation = await Location.find();
  
        res.status(200).json(getAllLocation);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  }

//   export const getLocation = async (req, res) => {
//     try {
//         const getAllLocation = await Location.find();
  
//         res.status(200).json(getAllLocation);
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
//   }

export default router;