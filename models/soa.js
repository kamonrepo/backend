import mongoose from 'mongoose';

const accuPaymentSchema = mongoose.Schema({
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'payments'},
    brcid: { type: mongoose.Schema.Types.ObjectId, ref: 'billruncandidates'},
    pmsgid: { type: mongoose.Schema.Types.ObjectId, ref: 'postmessages'},
    monthPeriod: { type: String },
    paymentDate: { type: String },
    dueDate: { type: String },
    mode: { type: String },
    b64Jpeg: { type: String },
    b64Pdf: { type: String },
    fileId: { type: String },
    filename: { type: String },
    filepath: { type: String },
    status: { type: String },
    createdAt: {
        type: Date,
        default: new Date()
    }
})

export default mongoose.model("soas", accuPaymentSchema);