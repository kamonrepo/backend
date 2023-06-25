import mongoose from 'mongoose';

const clientSchema = mongoose.Schema({
    name: { type: String, required: true }          ,
    contactNumber:  {type: String, required: true } ,
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories'},
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'plans'},
    planName: {type: String, required: true }       ,
    ipaddr: {type: String, required: true }         ,
    dueDate: {type: String, required: true }        ,
    monthlyFee: { type: String, required: true }    ,
    address: { type: String, required: true }       ,
    status: { type: String, default: 'Active'}      ,
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'groups'},
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model("Client", clientSchema);