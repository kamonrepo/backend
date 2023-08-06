import mongoose from 'mongoose';

const accuPaymentSchema = mongoose.Schema({

    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'payments'},
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