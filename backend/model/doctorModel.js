import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    available: { type: Boolean, default: true },
    fee: { type: Number, required: true },
    address: { type: Object, required: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
    averageRating: { type: Number, default: 0 },
    availableDays: { type: [String], default: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
    startTime: { type: String, default: "10:00" },
    endTime: { type: String, default: "21:00" },
    appointmentsPerDay: { type: Number, default: 0 },
    autoAccept: { type: Boolean, default: false },
    age: { type: Number, default: 0 },
    gender: { type: String, default: "Not Specified" },
    resetOtp: { type: String, default: "" },
    resetOtpExpire: { type: Number, default: 0 },
  },
  { minimize: false }
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
