import mongoose from 'mongoose';

const billRunCandidateSchema = mongoose.Schema({

    host: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    plan: {  type: mongoose.Schema.Types.ObjectId, ref: 'plans'},
    planName: { type: String, required: true },
    name: { type: String, required: true },
    monthlyFee: [],
    paymentDate: { type: String },
    dueDate: { type: String, required: true },
    monthPeriod: { type: String, required: true },
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("billruncandidates", billRunCandidateSchema);