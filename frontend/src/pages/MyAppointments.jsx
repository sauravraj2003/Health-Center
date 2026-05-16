import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyAppointments = () => {
  const { token, backendUrl, getDoctorsData } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [activeTab, setActiveTab] = useState("future");
  const navigate = useNavigate();
  const months = [
    "",
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split("_");
    return dateArray[0] + " " + months[dateArray[1]] + " " + dateArray[2];
  };

  const parseSlotDate = (slotDateStr) => {
    if(!slotDateStr) return new Date();
    const [day, month, year] = slotDateStr.split("_");
    return new Date(year, month - 1, day);
  };

  const isJoinable = (slotDate, slotTime) => {
    if (!slotDate || !slotTime) return false;
    const dateArray = slotDate.split("_");
    const [time, modifier] = slotTime.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;

    const appointmentStart = new Date(
      dateArray[2],
      dateArray[1] - 1,
      dateArray[0],
      hours,
      minutes
    );
    const appointmentEnd = new Date(appointmentStart.getTime() + 60 * 60 * 1000);
    const now = new Date();
    const earlyStart = new Date(appointmentStart.getTime() - 5 * 60 * 1000);

    return now >= earlyStart && now <= appointmentEnd;
  };

  const handleJoinVideo = (item) => {
    if (isJoinable(item.slotDate, item.slotTime)) {
      window.open(item.meetLink + '#config.disableModeratorIndicator=true&config.remoteVideoMenu.disableKick=true&config.disableRemoteMute=true', 'HMS_VideoCall_' + item._id);
    } else {
      toast.info(`Please come back at the scheduled time. Your slot is from ${item.slotTime} on ${slotDateFormat(item.slotDate)}.`);
    }
  };

  const getUsersAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/appointments", {
        headers: { token },
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/cancel-appointment",
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUsersAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;
    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/add-feedback",
        {
          userId: selectedAppointment.userId,
          docId: selectedAppointment.docId,
          appointmentId: selectedAppointment._id,
          rating,
          review,
        },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setFeedbackModal(false);
        setReview("");
        setRating(5);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // const initPay = (order) => {
  //   const options = {
  //     key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  //     amount: order.amount,
  //     currency: order.currency,
  //     name: "Appointment Payment",
  //     description: "Appointment Payment",
  //     order_id: order.id,
  //     receipt: order.receipt,
  //     handler: async (response) => {
  //       try {
  //         const { data } = await axios.post(
  //           backendUrl + "/api/user/verifyRazorpay",
  //           response,
  //           { headers: { token } }
  //         );
  //         if (data.success) {
  //           getUsersAppointments();
  //           toast.success(data.message);
  //           navigate("/my-appointments");
  //         }
  //       } catch (error) {
  //         console.error(error);
  //         toast.error(error.message);
  //       }
  //     },
  //   };

  //   const rzp = new window.Razorpay(options);
  //   rzp.open();
  // };

  // const appointmentRazorpay = async (appointmentId) => {
  //   try {
  //     const { data } = await axios.post(
  //       backendUrl + "/api/user/payment-razorpay",
  //       { appointmentId },
  //       {
  //         headers: { token },
  //       }
  //     );
  //     if (data.success) {
  //       initPay(data.order);
  //     } else {
  //       toast.error(data.message);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.message);
  //   }
  // };

  useEffect(() => {
    if (token) {
      getUsersAppointments();
      getDoctorsData();
    }
  }, [token]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(item => parseSlotDate(item.slotDate) >= today);
  const pastAppointments = appointments.filter(item => parseSlotDate(item.slotDate) < today);

  const displayedAppointments = activeTab === "future" ? upcomingAppointments : pastAppointments;

  return (
    <div>
      <div className="flex gap-6 pb-3 mt-12 border-b">
        <button
          className={`font-medium text-lg pb-2 ${activeTab === 'future' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('future')}
        >
          Upcoming Appointments
        </button>
        <button
          className={`font-medium text-lg pb-2 ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Appointments
        </button>
      </div>
      <div>
        {displayedAppointments.length !== 0 ? (
          displayedAppointments.map((item, index) => (
            <div
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
              key={index}
            >
              <div>
                <img
                  className="w-32 bg-indigo-50"
                  src={item.docData.image}
                  alt=""
                />
              </div>
              <div className="flex-1 text-md text-zinc-600">
                <p className="font-medium text-neutral-800">
                  {item.docData.name}
                </p>
                <p>{item.docData.speciality}</p>
                <p className="font-semibold text-zinc-700 mt-1">Address:</p>
                <p className="text-sm">{item.docData.address.line1}</p>
                <p className="text-sm">{item.docData.address.line2}</p>
                <p className="text-sm mt-1">
                  <span className="text-md text-neutral-700 font-medium">
                    Date & Time:
                  </span>{" "}
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
                <p className="text-sm mt-1">
                  <span className="text-md text-neutral-700 font-medium">
                    Type:
                  </span>{" "}
                  {item.consultationType || "Offline"}
                </p>
              </div>
              <div></div>
              <div className="flex flex-col gap-2 justify-end">
                {!item.cancelled && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border rounded text-green-600 bg-green-50 cursor-auto font-medium">
                    Free / Confirmed
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item._id)}
                    className="text-md text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}
                {!item.cancelled && !item.isCompleted && item.consultationType === 'Video' && item.meetLink && (
                  <button
                    onClick={() => handleJoinVideo(item)}
                    className="text-md text-white bg-primary text-center sm:min-w-48 py-2 border rounded hover:opacity-90 transition-all duration-300"
                  >
                    Join Video Call
                  </button>
                )}
                {item.cancelled && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-red-500  rounded text-red-500 cursor-not-allowed">
                    Appointment Cancelled
                  </button>
                )}
                {item.isCompleted && (
                  <div className="flex flex-col gap-2 w-full">
                    <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500 cursor-not-allowed">
                      Appointment Completed
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAppointment(item);
                        setFeedbackModal(true);
                      }}
                      className="sm:min-w-48 py-2 border border-blue-500 rounded text-blue-500 hover:bg-blue-50 transition-colors"
                    >
                      Leave / Edit Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="text-center text-2xl text-zinc-600 mt-4">
              No appointments found.
            </div>
            <div className="flex text-center sm:flex-col flex-row">
              <p className="mt-4 text-indigo-600 text-xl">
                Please Book an Appointment
              </p>
              <div>
                <button
                  className="mt-4 border py-4 px-6 rounded bg-primary text-white"
                  onClick={() => navigate("/doctors")}
                >
                  Book Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Leave Feedback for {selectedAppointment?.docData?.name}
            </h3>
            <form onSubmit={submitFeedback} className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Rating (1-5)</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full border rounded p-2 outline-primary"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Review</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full border rounded p-2 outline-primary h-24 resize-none"
                  placeholder="Share your experience..."
                  required
                ></textarea>
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
