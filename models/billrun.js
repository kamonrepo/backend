import mongoose from 'mongoose';

const billRunSchema = mongoose.Schema({

    billRun: { type: String, required: true },
    mergedGroup: [],
    status: { type: String, default: 'Active'},
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("billruns", billRunSchema);