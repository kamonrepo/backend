import mongoose from 'mongoose';

const targlocSchema = mongoose.Schema({
    sublocation: { type: mongoose.Schema.Types.ObjectId, ref: 'sublocations'},
    name: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model("targetlocation", targlocSchema);