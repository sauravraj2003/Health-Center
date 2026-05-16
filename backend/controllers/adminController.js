import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../model/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../model/appointmentModel.js";
import userModel from "../model/userModel.js";
import feedbackModel from "../model/feedbackModel.js";
import reportModel from "../model/reportModel.js";
import queryModel from "../model/queryModel.js";

// API for adding doctors
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      experience,
      about,
      fee,
      degree,
      address,
      availableDays,
      startTime,
      endTime,
      appointmentsPerDay,
      age,
      gender,
    } = req.body;

    const imageFile = req.file;

    // Check for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !about ||
      !fee ||
      !degree ||
      !address ||
      !experience ||
      !availableDays ||
      !startTime ||
      !endTime ||
      !appointmentsPerDay ||
      !age ||
      !gender
    ) {
      return res.json({ success: false, message: "Please Fill All Fields" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please Enter a valid Email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    // Hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload Image to cloudinary server
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      image: imageUrl,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fee,
      address: JSON.parse(address),
      date: Date.now(),
      availableDays: JSON.parse(availableDays),
      startTime,
      endTime,
      appointmentsPerDay: Number(appointmentsPerDay),
      age: Number(age),
      gender,
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.json({ success: true, message: "Doctor Added Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for the admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:");
    console.log("Received Email:", email);
    console.log("Expected Email:", process.env.ADMIN_EMAIL);
    console.log("Email Match:", email === process.env.ADMIN_EMAIL);
    console.log("Received Password:", password);
    console.log("Expected Password:", process.env.ADMIN_PASSWORD);
    console.log("Password Match:", password === process.env.ADMIN_PASSWORD);
    
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({
        success: true,
        message: "Admin Logged in Successfully",
        token,
      });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select("-password");
    res.json({
      success: true,
      message: "Doctors Data Fetch Successfully",
      doctors,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all Appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cencel appointment
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: "Admin",
    });

    // Releesing doctors slot
    const { docId, slotDate, slotTime } = appointmentData;

    const doctorData = await doctorModel.findById(docId);

    let slots_booked = doctorData.slots_booked;
    slots_booked[slotDate] = slots_booked[slotDate].filter(
      (e) => e !== slotTime
    );
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to accept appointment
const acceptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      isCompleted: true,
    });
    res.json({ success: true, message: "Appointment Accepted" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to remove doctor
const removeDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    await doctorModel.findByIdAndDelete(docId);
    res.json({ success: true, message: "Doctor Removed Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor settings (like appointmentsPerDay limit)
const updateDoctorSettings = async (req, res) => {
  try {
    const { docId, appointmentsPerDay } = req.body;
    await doctorModel.findByIdAndUpdate(docId, {
      appointmentsPerDay: Number(appointmentsPerDay),
    });
    res.json({ success: true, message: "Doctor Settings Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all feedbacks
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await feedbackModel.find({}).sort({ date: -1 });
    const populatedFeedbacks = await Promise.all(
      feedbacks.map(async (fb) => {
        const user = await userModel.findById(fb.userId).select("name");
        const doc = await doctorModel.findById(fb.docId).select("name");
        return { ...fb.toObject(), userName: user?.name, docName: doc?.name };
      })
    );
    res.json({ success: true, feedbacks: populatedFeedbacks });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete feedback
const deleteFeedback = async (req, res) => {
  try {
    const { feedbackId } = req.body;
    const feedback = await feedbackModel.findById(feedbackId);
    if (!feedback) {
      return res.json({ success: false, message: "Feedback not found" });
    }
    const docId = feedback.docId;
    await feedbackModel.findByIdAndDelete(feedbackId);

    // Helper to update doctor average rating
    const feedbacks = await feedbackModel.find({ docId });
    let avg = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      avg = (sum / feedbacks.length).toFixed(1);
    }
    await doctorModel.findByIdAndUpdate(docId, { averageRating: Number(avg) });

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user reports
const getUserReports = async (req, res) => {
  try {
    const { userId } = req.params;
    const reports = await reportModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to upload user report
const uploadUserReport = async (req, res) => {
  try {
    const { userId, name } = req.body;
    const file = req.file;

    if (!file || !name || !userId) {
      return res.json({ success: false, message: "File, name, and userId are required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    const newReport = new reportModel({
      userId,
      name,
      fileUrl: uploadResponse.secure_url,
      fileType: file.mimetype,
      date: Date.now(),
    });

    await newReport.save();
    res.json({ success: true, message: "Report uploaded successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete user report
const deleteUserReport = async (req, res) => {
  try {
    const { reportId } = req.body;
    await reportModel.findByIdAndDelete(reportId);
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all user queries
const getQueries = async (req, res) => {
  try {
    const queries = await queryModel.find({}).sort({ date: -1 });
    res.json({ success: true, queries });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
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
};
