import mongoose from 'mongoose';

const categorySchema = mongoose.Schema({

    category: { type: String, required: true },
    status: { type: String, default: 'Active'},
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("categories", categorySchema);