import mongoose from "mongoose";

const querySchema = new mongoose.Schema({
  userId: { type: String, required: false },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Number, required: true },
});

const queryModel =
  mongoose.models.query || mongoose.model("query", querySchema);

export default queryModel;
