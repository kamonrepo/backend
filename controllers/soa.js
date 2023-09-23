import express from 'express';
import Soa from '../models/soa.js';
import path from 'path';

const router = express.Router();


export const getSoas = async (req, res) => {
    try {
        const getAllSoas = await Soa.find();
  
        res.status(200).json(getAllSoas);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const getSoaByPMSGID = async (req, res) => {
    try {

        // const SOA = await Soa.findById(req.body.id);
        const myId = req.params.id;


        // Assuming you have a MongoDB model named File
        Soa.findOne({ pmsgid: myId }, (err, file) => {
          if (err || !file) {
            return res.status(404).json({ error: 'getSoaByPMSGID - File not found' });
          }
      
        
          // const filePath = new URL(file.filepath, import.meta.url).pathname;
          // const filePath = 'C:\\etc\\newnew\\backend\\fsys\\jpeg\\GST-09232023075823-567-567.jpg'
          const filePath = file.filepath;
          console.log('filePath::: ', file.filepath);
          res.status(200).sendFile(filePath);

        });

    } catch (error) {
        console.log('ctrl-getSoaByPMSGID-myId-ERROR::: ', error);
        res.status(404).json({ message: error.message });
    }
}

export default router;