import mongoose from 'mongoose';

const groupSchema = mongoose.Schema({
    name: { type: String, required: true },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'client'
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model("Group", groupSchema);