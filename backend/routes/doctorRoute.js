import express from "express";
import {
  appointmentsDoctor,
  doctorList,
  loginDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
} from "../controllers/doctorController.js";
import { doctorForgotPassword, doctorVerifyOtpAndResetPassword } from "../controllers/authController.js";
import authDoctor from "../middleware/authDoctor.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

// Auth Routes for forgot password
doctorRouter.post("/forgot-password", doctorForgotPassword);
doctorRouter.post("/verify-otp", doctorVerifyOtpAndResetPassword);

export default doctorRouter;
