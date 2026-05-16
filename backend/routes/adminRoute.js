import express from "express";
import {
  addDoctor,
  allDoctors,
  loginAdmin,
  appointmentsAdmin,
  appointmentCancel,
  adminDashboard,
  getAllFeedbacks,
  deleteFeedback,
  getAllUsers,
  getUserReports,
  uploadUserReport,
  deleteUserReport,
  acceptAppointment,
  removeDoctor,
  updateDoctorSettings,
  getQueries,
} from "../controllers/adminController.js";
import upload from "../middleware/multer.js";
import authAdmin from "../middleware/authAdmin.js";
import { changeAvailabilities } from "../controllers/doctorController.js";

const adminRouter = express.Router();

adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.post("/all-doctors", authAdmin, allDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailabilities);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointments", authAdmin, appointmentCancel);
adminRouter.post("/accept-appointment", authAdmin, acceptAppointment);
adminRouter.post("/remove-doctor", authAdmin, removeDoctor);
adminRouter.post("/update-doctor-settings", authAdmin, updateDoctorSettings);
adminRouter.get("/dashboard", authAdmin, adminDashboard);

// Feedback Routes
adminRouter.get("/feedbacks", authAdmin, getAllFeedbacks);
adminRouter.post("/delete-feedback", authAdmin, deleteFeedback);

// Report Routes
adminRouter.get("/users", authAdmin, getAllUsers);
adminRouter.get("/user-reports/:userId", authAdmin, getUserReports);
adminRouter.post("/upload-report", authAdmin, upload.single("file"), uploadUserReport);
adminRouter.post("/delete-report", authAdmin, deleteUserReport);

// Queries Route
adminRouter.get("/queries", authAdmin, getQueries);

export default adminRouter;
