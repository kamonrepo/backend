import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({

    billrun: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
    total: { type: String, default: '0' },
    paid: { type: String, default: '0' },
    unpaid: { type: String, default: '0' },
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})



export default mongoose.model("payments", paymentSchema);