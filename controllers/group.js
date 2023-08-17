import express from 'express';
import Group from '../models/group.js';
import Sublocation from '../models/sublocation.js';
import Targetlocation from '../models/targetlocation.js';
import BillRun from '../models/billrun.js';

const router = express.Router();

export const getGroups = async (req, res) => {
    try {
        const getAllGroups = await Group.find();
  
        res.status(200).json(getAllGroups);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getSublocs  = async (req, res) => {

    try {
        const getAllSublocs = await Sublocation.find();
        res.status(200).json(getAllSublocs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getTargetlocs  = async (req, res) => {

    try {
        const getAllTargetlocs = await Targetlocation.find();
        res.status(200).json(getAllTargetlocs);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const createGroup  = async (req, res) => {

    const group = req.body;

    console.log('createGroup-group-req: ', group);
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
  
    const sublocation = req.body;
    console.log('createSubloc-sublocation-req::: ', sublocation);
    const newSublocation = new Sublocation(sublocation);

    try {
         await newSublocation.save();

         res.status(200).json(newSublocation);

    } catch (error) {
        console.log('catch-createSubloc: ', error);
        res.status(404).json({ message: error.message });
    }
}

export const createTargetLoc = async (req, res) => {
  
    const targetloc = req.body;
    console.log('createTargetLoc-targetloc-req::: ', targetloc);
    const newTargetlocation = new Targetlocation(targetloc);

    //if targetloc ceration is success then create bill run. nad use the newly created targetloc id

    try {

        await newTargetlocation.save();
        if(newTargetlocation) {
            
            let payload = { billRun: targetloc.name, targetlocId: newTargetlocation._id };
            let buildMergedGroup = [];

            buildMergedGroup.push({id:  newTargetlocation._id, name: targetloc.name});

            Object.assign(payload, { mergedGroup: buildMergedGroup });

            let newBillRun = new BillRun(payload);
            await newBillRun.save();
        } 

        res.status(200).json(newTargetlocation);

    } catch (error) {
        console.log('catch-createTargetLoc: ', error);
        res.status(404).json({ message: error.message });
    }
}

export default router;