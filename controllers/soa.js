import express from 'express';
import Soa from '../models/soa.js';
import path from 'path';
import fs from 'fs';

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

        const myId = req.params.id;

        Soa.findOne({ pmsgid: myId }, (err, file) => {
          if (err || !file) {
            return res.status(404).json({ error: 'getSoaByPMSGID - File not found' });
          }
          const filename = file.filename;
          res.status(200).json(filename);

        //send the actual jpeg file/binary
        //  const filePath = file.filepath;
        //  console.log('sendFile HEYYYY!!!');
        //  res.status(200).sendFile(filePath);

        // read the target file and send to the client.
        //  fs.readFile(filePath, (error, data) => {
        //     if (error) return
            
        //     res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        //     res.end(data, 'utf8');
        // })
        });

    } catch (error) {
        console.log('ctrl-getSoaByPMSGID-myId-ERROR::: ', error);
        res.status(404).json({ message: error.message });
    }
}

export default router;