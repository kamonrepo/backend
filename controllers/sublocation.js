import express from 'express';
import Group from '../models/group.js';
import Sublocation from '../models/sublocation.js';
const router = express.Router();


export const createSublocation = async (req, res) => {
    const sublocation = req.body;
    const newSublocation = new Sublocation(sublocation);
    try {

        // console.log('back-createSubloc', req.body);
        //  const group = await Sublocation(req.body.groupId);
        //  console.log('back-createSubloc--group', group);
        //  const index = group.subloc.findIndex(data => data === req.body.groupId);
        //  console.log('back-createSubloc--index', index);
        // if (index === -1) {
        // } else {
        // //already exist
        // }
        // // const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
    

        await newSublocation.save();
         res.status(200).json(newSublocation);

    } catch (error) {
        // console.log('catch-createSubloc: ', error);
        // res.status(404).json({ message: error.message });
        res.status(404).json({});
    }
}


export const getSublocations = async (req, res) => {
    try {
        const getAllGroups = await Group.find();
  
        res.status(200).json(getAllGroups);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export default router;