import mongoose from 'mongoose';

const clientSchema = mongoose.Schema({
    name: { type: String, required: true },
    contactNumber:  {type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'plans'},
    accountNumber: { type: String, required: true },
    planName: {type: String, required: true },
    ipaddr: {type: String, required: true },
    dueDate: {type: String, required: true },
    monthlyFee: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, default: 'Active'},
    targetlocId: { type: mongoose.Schema.Types.ObjectId, ref: 'targetlocations'},
    targetlocCode: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model("Client", clientSchema);