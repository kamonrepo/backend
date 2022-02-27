import express from 'express';
import Group from '../models/group.js';

const router = express.Router();

export const createGroup  = async (req, res) => {

    const group = req.body;

    const newGroup = new Group(group);
    try {

        await newGroup.save();
        res.status(201).json(newGroup);

    } catch (error) {
        console.log('server-controller-location-catch-error: ', error);
        res.status(404).json({ message: error.message });
    }
}

export const getGroups = async (req, res) => {
    try {
        const getAllGroups = await Group.find();
  
        res.status(200).json(getAllGroups);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
  }

export default router;