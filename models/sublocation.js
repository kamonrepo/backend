import mongoose from 'mongoose';

const sublocSchema = mongoose.Schema({
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'groups'},
    name: { type: String, required: true },
    createdAt: {
        type: Date,
        default: new Date(),
    }
})

export default mongoose.model("sublocation", sublocSchema);