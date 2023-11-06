import mongoose from 'mongoose';
import moment from 'moment-timezone';

const paymentSchema = mongoose.Schema({

    billrun: { type: mongoose.Schema.Types.ObjectId, ref: 'billruns'},
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'clients'},
    summary: [],
    manilaTZ: {
        type: Date,
        default: moment.tz('Asia/Manila').format()
    }
})


export default mongoose.model("payments", paymentSchema);