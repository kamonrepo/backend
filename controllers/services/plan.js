import express from 'express';
import Plan from '../../models/services/plan.js';
import  mongoose  from "mongoose";

const router = express.Router();

export const getPlan = async (req, res) => {
    try {
        const plan = await Plan.find();

        res.status(200).json(plan);

    } catch (error) {
        res.status(404).json({ message: error.message });
    }

};

export const getPlanByCategoryId = async (req, res) => { 

    const categoryId = req.params.id;

   try {

       const plans = await Plan.find({ category: categoryId  });
       res.status(200).json(plans);

   } catch (error) {
       res.status(404).json({ message: error.message });
   }
}


export const createPlan = async (req, res) => {

    try {
        let typeParam = req.body.type;
            if(typeParam == 'create') {
                console.log('createPlan:::---', req.body);
                const plan = new Plan(req.body);
                await plan.save();

                res.status(200).json(plan);
            } else {

            //update existing 
            let id = req.body.planId;
            let updatedPlan = { plan: req.body.plan };
            if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No plan with id: ${id}`);

            let updatePlan = await Plan.findByIdAndUpdate(id, updatedPlan);
            console.log('plan updated::: ', updatePlan);
            await updatePlan.save();

            res.status(200).json(updatedCategory);
            }

    } catch (error) {
        console.log('createPlan-errrr::: ', error.message);
        res.status(404).json({ message: error.message });
    }
};

export default router;