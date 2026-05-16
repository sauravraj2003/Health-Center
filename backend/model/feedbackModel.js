import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  appointmentId: { type: String, required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  date: { type: Number, required: true },
});

const feedbackModel =
  mongoose.models.feedback || mongoose.model("feedback", feedbackSchema);

export default feedbackModel;
