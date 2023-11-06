import mongoose from 'mongoose';

const accuPaymentSchema = mongoose.Schema({
    
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'payments'},
    brc: { type: mongoose.Schema.Types.ObjectId, ref: 'billruncandidates'},
    brid: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
    period: { type: String },
    manilaTz: { type: String, required: true },
    mode: { type: String },
    monthlyFee: [],
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})


export default mongoose.model("accumulatedpayments", accuPaymentSchema);