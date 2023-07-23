import mongoose from 'mongoose';

const billRunSchema = mongoose.Schema({

    billRun: { type: String, required: true }, //targetloc
    targetlocId: { type: String, required: true }, //targetlocId
    mergedGroup: [],
    status: { type: String, default: 'Active'},
    total: { type: String, default: '0' },
    paid: { type: String, default: '0' },
    unpaid: { type: String, default: '0' },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("billruns", billRunSchema);