import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import express from 'express';
import  mongoose  from "mongoose";
import UserModel from "../models/user.js";

const secret = 'test';
const router = express.Router();

export const getUsers = async (req, res) => {
  try {
      const getAllUser = await UserModel.find();

      res.status(200).json(getAllUser);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
}

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user with id: ${id}`);

    await UserModel.findByIdAndUpdate(id, updatedUser);
    res.json(updatedUser);
}

export const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });

    if (!oldUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, secret, { expiresIn: "1h" });

    res.status(200).json({ result: oldUser, token });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const signup = async (req, res) => {
  console.log('SERVERR controllerrrr:::: ',req.body)
  const { email, password, firstName, lastName } = req.body;

  try {
    const oldUser = await UserModel.findOne({ email });

    if (oldUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await UserModel.create({ email, password: hashedPassword, firstname: firstName, lastname: lastName });

    const token = jwt.sign( { email: result.email, id: result._id }, secret, { expiresIn: "1h" } );

    res.status(201).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
    
    console.log(error);
  }
};

export default router;
