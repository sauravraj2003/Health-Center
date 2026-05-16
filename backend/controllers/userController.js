import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../model/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../model/doctorModel.js";
import appointmentModel from "../model/appointmentModel.js";
import feedbackModel from "../model/feedbackModel.js";
import reportModel from "../model/reportModel.js";
import queryModel from "../model/queryModel.js";
// import razorpay from "razorpay";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaing that any fields are not empty
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Vlaidating Email Format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Validating Password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password should be at least 8 characters long",
      });
    }

    // Check if user already exists
    const userExists = await userModel.findOne({ email });
    if (userExists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hashing User Password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ success: true, message: "User Login successfully", token });
    } else {
      res.json({ success: false, message: "Incorrect Password" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Profile Data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update User Profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;
    const imageFile = req.file;

    if (!name || !phone || !dob || !gender) {
      return res.json({ success: false, message: "Some Data are Missing" });
    }
    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (imageFile) {
      // Upload image to cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      const imageURL = imageUpload.secure_url;
      await userModel.findByIdAndUpdate(userId, { image: imageURL });
    }
    res.json({ success: true, message: "Profile Updated Successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to book Appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime, consultationType } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData.available) {
      return res.json({
        success: false,
        message: "Doctor is not available for Appointment",
      });
    }
    let slots_booked = docData.slots_booked;

    // checking for slots availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.json({
          success: false,
          message: "Slot is not available",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");
    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      slotDate,
      slotTime,
      userData,
      docData,
      amount: 0, // Free appointment
      payment: true, // Mark as paid since it's free
      date: new Date().getTime(),
      isAccepted: docData.autoAccept === true,
      consultationType: consultationType || "Offline",
      meetLink: consultationType === "Video" ? `https://meet.jit.si/HMS_${Date.now()}_${Math.floor(Math.random()*1000)}` : "",
    };
    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment booked" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get User Appointments for My Appointments Page
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;
    const appointments = await appointmentModel.find({ userId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to cancel Appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    // Verify that the appointment is booked by this user
    if (appointmentData.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized Action" });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
      cancelledBy: "Patient",
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

// // Creating razorpay instance with error handling
// let razorpayInstance;
// try {
//   razorpayInstance = new razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID,
//     key_secret: process.env.RAZORPAY_KEY_SECRET,
//   });
// } catch (error) {
//   console.error("Razorpay initialization error:", error);
//   razorpayInstance = null;
// }

// // API to make payment of Appointment using razorpay
// const paymentRazorpay = async (req, res) => {
//   try {
//     if (!razorpayInstance) {
//       return res.json({
//         success: false,
//         message: "Payment service is not configured",
//       });
//     }
//     const { appointmentId } = req.body;
//     const appointmentData = await appointmentModel.findById(appointmentId);
//     if (!appointmentData || appointmentData.cancelled) {
//       return res.json({
//         success: false,
//         message: "Apoointment Cancelled or Not found",
//       });
//     }

//     // Creating options for razorpay paymnet
//     const options = {
//       amount: appointmentData.amount * 100,
//       currency: process.env.CURRENCY,
//       receipt: appointmentId,
//     };

//     // creation of an order
//     const order = await razorpayInstance.orders.create(options);
//     res.json({ success: true, order });
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// // API to verify payment of razorpay
// const verifyRazorpay = async (req, res) => {
//   try {
//     if (!razorpayInstance) {
//       return res.json({
//         success: false,
//         message: "Payment service is not configured",
//       });
//     }
//     const { razorpay_order_id } = req.body;
//     const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

//     if (orderInfo.status === "paid") {
//       await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {
//         payment: true,
//       });
//       res.json({ success: true, message: "Payment Successful" });
//     } else {
//       res.json({ success: false, message: "Payment Failed" });
//     }
//   } catch (error) {
//     console.error(error);
//     res.json({ success: false, message: error.message });
//   }
// };

// API to add feedback
const addFeedback = async (req, res) => {
  try {
    const { userId, docId, appointmentId, rating, review } = req.body;
    
    // Check if appointment exists and is completed
    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment || !appointment.isCompleted) {
      return res.json({ success: false, message: "Feedback can only be given after appointment is completed" });
    }

    if (appointment.userId !== userId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    // Helper to update doctor average rating
    const updateDoctorAverageRating = async (doctorId) => {
      const feedbacks = await feedbackModel.find({ docId: doctorId });
      let avg = 0;
      if (feedbacks.length > 0) {
        const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        avg = (sum / feedbacks.length).toFixed(1);
      }
      await doctorModel.findByIdAndUpdate(doctorId, { averageRating: Number(avg) });
    };

    // Check if feedback already exists
    const existingFeedback = await feedbackModel.findOne({ appointmentId });
    if (existingFeedback) {
      existingFeedback.rating = rating;
      existingFeedback.review = review;
      existingFeedback.date = Date.now();
      await existingFeedback.save();
      await updateDoctorAverageRating(docId);
      return res.json({ success: true, message: "Feedback updated successfully" });
    }

    const newFeedback = new feedbackModel({
      userId,
      docId,
      appointmentId,
      rating,
      review,
      date: Date.now(),
    });

    await newFeedback.save();
    await updateDoctorAverageRating(docId);
    res.json({ success: true, message: "Feedback submitted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor feedbacks
const getDoctorFeedbacks = async (req, res) => {
  try {
    const { docId } = req.params;
    const feedbacks = await feedbackModel.find({ docId }).sort({ date: -1 });
    
    let averageRating = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, curr) => acc + curr.rating, 0);
      averageRating = (sum / feedbacks.length).toFixed(1);
    }

    // Include basic user info (name) with feedback
    const populatedFeedbacks = await Promise.all(
      feedbacks.map(async (fb) => {
        const user = await userModel.findById(fb.userId).select("name image");
        return { ...fb.toObject(), userData: user };
      })
    );

    res.json({ success: true, feedbacks: populatedFeedbacks, averageRating });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to upload report
const uploadReport = async (req, res) => {
  try {
    const { name } = req.body;
    const { token } = req.headers;
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    const userId = token_decode.id;

    const file = req.file;

    if (!file || !name) {
      return res.json({ success: false, message: "File and name are required" });
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

// API to get user reports
const getReports = async (req, res) => {
  try {
    const { userId } = req.body;
    const reports = await reportModel.find({ userId }).sort({ date: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to delete report
const deleteReport = async (req, res) => {
  try {
    const { userId, reportId } = req.body;
    const report = await reportModel.findById(reportId);
    if (!report || report.userId !== userId) {
      return res.json({ success: false, message: "Report not found or unauthorized" });
    }
    await reportModel.findByIdAndDelete(reportId);
    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// API to submit contact query
const submitQuery = async (req, res) => {
  try {
    const { userId, name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.json({ success: false, message: "Missing Details" });
    }
    const newQuery = new queryModel({
      userId: userId || "",
      name,
      email,
      message,
      date: Date.now(),
    });
    await newQuery.save();
    res.json({ success: true, message: "Query submitted successfully" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {
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
  // paymentRazorpay,
  // verifyRazorpay,
};
