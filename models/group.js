import mongoose from 'mongoose';

const groupSchema = mongoose.Schema({
    name: { type: String, required: true },
    subloc: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

export default mongoose.model("Group", groupSchema);