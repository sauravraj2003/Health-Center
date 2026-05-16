import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, required: true },
  date: { type: Number, required: true },
});

const reportModel =
  mongoose.models.report || mongoose.model("report", reportSchema);

export default reportModel;
