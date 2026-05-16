import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext.jsx";
import { assets } from "../assets/assets.js";
import RelatedDoctors from "../components/RelatedDoctors.jsx";
import { toast } from "react-toastify";
import { Loader2, Star } from "lucide-react";
import axios from "axios";

const Appointments = () => {
  const [docInfo, setDocInfo] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { docId } = useParams();
  const navigate = useNavigate();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [consultationType, setConsultationType] = useState("Offline");

  const fetchDocInfo = () => {
    const doctorInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(doctorInfo);
  };

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/doctor-feedbacks/" + docId);
      if (data.success) {
        setFeedbacks(data.feedbacks.slice(0, 3)); // show top 3
        setAverageRating(data.averageRating);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getAvailableSlots = () => {
    if (!docInfo) return;
    setDocSlots([]);

    let today = new Date();
    if (today.getHours() >= 20) {
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      ).getDate();
      if (today.getDate() === lastDayOfMonth) {
        today.setMonth(today.getMonth() + 1, 1);
      } else {
        today.setDate(today.getDate() + 1);
      }
      today.setHours(docInfo.startTime ? parseInt(docInfo.startTime.split(":")[0]) : 10, docInfo.startTime ? parseInt(docInfo.startTime.split(":")[1]) : 0, 0, 0);
    }

    let daysAdded = 0;
    let i = 0;
    while (daysAdded < 14 && i < 60) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      
      let dayOfWeek = daysOfWeek[currentDate.getDay()];
      if (docInfo.availableDays && !docInfo.availableDays.includes(dayOfWeek)) {
        i++;
        continue;
      }

      let endTime = new Date(today);
      endTime.setDate(today.getDate() + i);
      let endHour = docInfo.endTime ? parseInt(docInfo.endTime.split(":")[0]) : 21;
      let endMinute = docInfo.endTime ? parseInt(docInfo.endTime.split(":")[1]) : 0;
      endTime.setHours(endHour, endMinute, 0, 0);

      let startHour = docInfo.startTime ? parseInt(docInfo.startTime.split(":")[0]) : 10;
      let startMinute = docInfo.startTime ? parseInt(docInfo.startTime.split(":")[1]) : 0;

      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(
          currentDate.getHours() > startHour ? currentDate.getHours() + 1 : startHour
        );
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : startMinute);
      } else {
        currentDate.setHours(startHour, startMinute, 0, 0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;
        const isSlotAvailable =
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(slotTime)
            ? false
            : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      if (timeSlots.length > 0) {
        setDocSlots((prev) => [...prev, timeSlots]);
        daysAdded++;
      }
      i++;
    }
  };

  const bookAppointment = async () => {
    try {
      if (!token) {
        toast.warn("Login to book Appointment");
        return navigate("/login");
      }

      setIsBooking(true);
      const date = docSlots[slotIndex][0].datetime;

      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        {
          docId,
          slotDate,
          slotTime,
          consultationType,
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        getDoctorsData();
        navigate("/my-appointments");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsBooking(false);
    }
  };

  useEffect(() => {
    fetchDocInfo();
    fetchFeedbacks();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* Doctor Details */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt={docInfo.name}
            />
          </div>

          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* DocInfo : Name, Degree, Experience */}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-lg mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-sm rounded-full">
                {docInfo.experience}
              </button>
            </div>

            {/* Docinfo About */}
            <div>
              <p className="flex items-center gap-1 text-lg font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-md text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>

            {/* Ratings Summary */}
            {averageRating > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <p className="font-medium text-gray-800">Average Rating:</p>
                <div className="flex items-center text-yellow-500">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="ml-1 text-gray-700 font-semibold">{averageRating} / 5</span>
                  <span className="ml-2 text-sm text-gray-500">({feedbacks.length} reviews)</span>
                </div>
              </div>
            )}

            {/* Appointment Fees */}
            <p className="text-gray-500 font-medium mt-4">
              Appointment Fee:{" "}
              <span className="text-gray-600">
                {currencySymbol} {docInfo.fee}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Slots */}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking Slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots.map((item, index) => (
                <div
                  className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                    slotIndex === index
                      ? "bg-primary text-white"
                      : "border border-gray-200"
                  }`}
                  onClick={() => {
                    setSlotIndex(index);
                    setSlotTime("");
                  }}
                  key={index}
                >
                  {item.length > 0 && (
                    <>
                      <p>{daysOfWeek[item[0].datetime.getDay()]}</p>
                      <p>{item[0].datetime.getDate()}</p>
                    </>
                  )}
                </div>
              ))}
          </div>
          <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
            {docSlots.length &&
              docSlots[slotIndex].map((item, index) => (
                <p
                  onClick={() => setSlotTime(item.time)}
                  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                    item.time === slotTime
                      ? "bg-primary text-white"
                      : "text-gray-400 border border-gray-300"
                  }`}
                  key={index}
                >
                  {item.time.toLowerCase()}
                </p>
              ))}
          </div>
          <div className="mt-6 flex items-center gap-4">
            <p className="font-medium text-gray-700">Consultation Type:</p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="consultationType" 
                value="Offline" 
                checked={consultationType === "Offline"} 
                onChange={() => setConsultationType("Offline")} 
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              Offline
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="consultationType" 
                value="Video" 
                checked={consultationType === "Video"} 
                onChange={() => setConsultationType("Video")} 
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              Video Call
            </label>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isBooking}
            className="bg-primary text-white text-sm font-light px-14 py-3 rounded-full my-6 flex items-center gap-2 disabled:opacity-70"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              "Book an Appointment"
            )}
          </button>
        </div>

        {/* Confirmation Popup */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Appointment for Free
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to book this appointment? It is completely free.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    setShowConfirm(false);
                    await bookAppointment();
                  }}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Feedbacks */}
        {feedbacks.length > 0 && (
          <div className="mt-8 mb-12 sm:ml-72 sm:pl-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Reviews</h3>
            <div className="flex flex-col gap-4">
              {feedbacks.map((fb) => (
                <div key={fb._id} className="border border-gray-200 rounded-lg p-5 bg-zinc-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {fb.userData?.image ? (
                          <img src={fb.userData.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-500 font-bold">{fb.userData?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{fb.userData?.name || "Patient"}</p>
                        <p className="text-xs text-gray-500">{new Date(fb.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < fb.rating ? "fill-current" : "text-gray-300"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{fb.review}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listing Related Doctor */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointments;
