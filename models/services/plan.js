import mongoose from 'mongoose';

const planSchema = mongoose.Schema({

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
    plan: { type: String, required: true },
    price: { type: String, required: true },
    status: { type: String, default: 'Active' },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("plans", planSchema);