import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  addFeedback,
  getDoctorFeedbacks,
  uploadReport,
  getReports,
  deleteReport,
  submitQuery,
} from "../controllers/userController.js";
import { userForgotPassword, userVerifyOtpAndResetPassword } from "../controllers/authController.js";
import authUser from "../middleware/authUser.js";
import upload from "../middleware/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);

// Feedback Routes
userRouter.post("/add-feedback", authUser, addFeedback);
userRouter.get("/doctor-feedbacks/:docId", getDoctorFeedbacks);

// Report Routes
userRouter.post("/upload-report", authUser, upload.single("file"), uploadReport);
userRouter.get("/reports", authUser, getReports);
userRouter.post("/delete-report", authUser, deleteReport);

// Auth Routes for forgot password
userRouter.post("/forgot-password", userForgotPassword);
userRouter.post("/verify-otp", userVerifyOtpAndResetPassword);

userRouter.post("/submit-query", submitQuery);

export default userRouter;
