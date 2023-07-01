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

export const createSubloc = async (req, res) => {

    try {

        console.log('back-createSubloc', req.body);
         const group = await Group.findById(req.body.groupId);
         console.log('back-createSubloc--group', group);

         const index = group.subloc.findIndex(data => data === req.body.groupId);
         console.log('back-createSubloc--index', index);

        if (index === -1) {
          
        } else {
         
            //already exist
          
        }
        // const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
    
         res.status(200).json({ k: true});

    } catch (error) {
        // console.log('catch-createSubloc: ', error);
        // res.status(404).json({ message: error.message });
        res.status(404).json({});
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