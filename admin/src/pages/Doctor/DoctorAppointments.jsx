import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
  } = useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    dToken && getAppointments();
  }, [dToken]);

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
      window.open(item.meetLink, 'HMS_VideoCall_' + item._id);
    } else {
      toast.info(`Please come back at the scheduled time. Your slot is from ${item.slotTime} on ${slotDateFormat(item.slotDate)}.`);
    }
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>
      <div className="bg-white border rounded texxt-sm max-h-[80vh] overflow-y-scroll min-h-[50vh]">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fee</p>
          <p>Type</p>
          <p>Action</p>
        </div>
        {appointments.reverse().map((item, index) => (
          <div
            key={index}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 items-center text-gray-500py-3 px-6 py-3 border-b hover:bg-gray-50"
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                className="w-8 rounded-full"
                src={item.userData.image}
                alt=""
              />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className="text-sm inline border border-primary px-2  rounded-full">
                {item.payment ? "Online" : "Cash"}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>
              {slotDateFormat(item.slotDate)}, {item.slotTime}
            </p>
            <p>
              {currency}
              {item.amount}
            </p>
            <div>
              <p className="text-sm">{item.consultationType || "Offline"}</p>
              {item.consultationType === "Video" && item.meetLink && !item.cancelled && !item.isCompleted && (
                <button
                  onClick={() => handleJoinVideo(item)}
                  className="block mt-1 text-xs text-white bg-primary px-2 py-1 rounded hover:opacity-90 transition-all"
                >
                  Join
                </button>
              )}
            </div>
            {item.cancelled ? (
              <p className="text-red-400 text-sm font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-500 text-sm font-medium">Completed</p>
            ) : (
              <div className="flex">
                <img
                  className="w-10 cursor-pointer"
                  src={assets.cancel_icon}
                  alt=""
                  onClick={() => cancelAppointment(item._id)}
                />
                <img
                  className="w-10 cursor-pointer"
                  src={assets.tick_icon}
                  alt=""
                  onClick={() => completeAppointment(item._id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
