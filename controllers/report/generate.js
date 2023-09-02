
import express from 'express';
import template from '../report/templates/index.js';


const router = express.Router();

const generateDoc = async (req, res) => {
    try {

        let base64 = await template(req.body);
        return base64; 
    }
    catch(e) {
        return e;
    }

}


export const generate = async (req, res) => {
    try {

        console.log('generateDoc-req: ', req.body);
        let ret = await generateDoc(req)

        res.status(200).json(ret);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export default router;