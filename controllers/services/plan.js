import express from 'express';
import Plan from '../../models/services/plan.js';

const router = express.Router();

export const getPlan = async (req, res) => {
    try {
        const plan = await Plan.find();

        res.status(200).json(plan);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }

};


export const createPlan = async (req, res) => {

    try {
        console.log('createPlan-req::: ', req.body);

        const plan = new Plan(req.body);
        await plan.save();

        res.status(200).json(plan);

    } catch (error) {

        console.log('createPlan-errrr::: ', error.message);

        res.status(404).json({ message: error.message });
    }
};

export default router;