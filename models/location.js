import mongoose from "mongoose";

const locationSchema = mongoose.Schema({
  island: { type: String, required:  true },
  province: { type: String, required:  true },
  mainLocation: { type: String, required: true },
  subLocation: { type: String, required: true }

});

export default mongoose.model("Location", locationSchema);