import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema({

    billrun: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    grandTotal: { type: String, default: '0' },
    totalPaid: { type: String, default: '0' },
    totalUnpaid: { type: String, default: '0' },
    recentPaymentPeriod: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})



export default mongoose.model("payments", paymentSchema);