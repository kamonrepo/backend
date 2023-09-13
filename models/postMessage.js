import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: { type: String },
    message: { type: String },
    owner: { type: String },
    creator: { type: String },
    selectedFile: { type: String },
    monthPeriod: { type: String },
    tags: { type: [String], default: [] },
    likes: { type: [String], default: [] },
    comments: { type: [String], default: []},
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model('PostMessage', postSchema);
