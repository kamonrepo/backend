import mongoose from 'mongoose';

const accuPaymentSchema = mongoose.Schema({
    
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'payments'},
    brc: { type: mongoose.Schema.Types.ObjectId, ref: 'billruncandidates'},
    period: { type: String },
    mode: { type: String },
    amount: { type: String },
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})


export default mongoose.model("accumulatedpayments", accuPaymentSchema);