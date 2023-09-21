import express from 'express';
import mongoose from 'mongoose';
import PostMessage from '../models/postMessage.js';

const router = express.Router();

export const getPosts = async (req, res) => { 
    console.log('ctrl-getPosts-init-func()');
     const { page } = req.query; //old
    // const { page, selectedFile  } = req.body;
     //although the page on the front end is integer, when it passes to req.query
     //it became string, so -> convert into number

    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of every page

        //count all the docs so that last page will be determined
        const total = await PostMessage.countDocuments({});

         // -1 will give us the newest posts first
        const posts = await PostMessage.find().sort({ _id: -1}).limit(LIMIT).skip(startIndex); 
        
        console.log('ctrl-getPosts-length: ', posts.length);
        res.status(200).json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});

    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getPostsBySearch = async (req, res) => {
    console.log('ctrl-getPostsBySearch-init');
    const { searchQuery, tags } = req.query;


    try {
        const title = new RegExp(searchQuery, 'i')

        const posts = await PostMessage.find({ $or: [ { title }, { tags : { $in: tags.split(',')}}]});
        console.log('ctrl-getPostsBySearch: ', posts.length);

        res.json({ data: posts}); //this return will send to front end
    } catch(error) {
        res.status(404).json({ message: error.message})
    }
}

export const getPost = async (req, res) => { 
    console.log('ctrl-getPost-init');

    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id);
        console.log('ctrl-getPost', post.length);
        
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const createPost = async (req, res) => {
    const post = req.body;

    const newPostMessage = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    console.log('try to save this with multiple tags: ', newPostMessage)

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage );
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostMessage.findByIdAndUpdate(id, updatedPost);

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}

export const likePost = async (req, res) => {

    const { id } = req.params;

    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id ===String(req.userId));

    if (index === -1) {

      post.likes.push(req.userId);
    } else {
     
        //unlike
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });


    if(updatedPost) {
            //kamon
    //  let io = req.app.get('socketio');
    //  io.emit('updateLike');
    //  console.log('SERVER: socket.io.emit.updateLike');
    }

    res.status(200).json(updatedPost);
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    const post = await PostMessage.findById(id);

    post.comments.push(value);

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.json(updatedPost);
}







export default router;