import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";

const AdminPatientProfile = () => {
  const { id } = useParams();
  const { users, getAllUsers, appointments, getAllAppointments } = useContext(AdminContext);
  const [profileData, setProfileData] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (users.length > 0) {
      const user = users.find((u) => u._id === id);
      if (user) {
        setProfileData(user);
      }
    } else {
      getAllUsers();
    }
  }, [users, id]);

  useEffect(() => {
    if (appointments.length === 0) {
      getAllAppointments();
    } else {
      setPatientAppointments(appointments.filter(a => a.userId === id));
    }
  }, [appointments, id]);

  if (!profileData) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex flex-col gap-4 m-5">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-black w-fit mb-4">
          &larr; Back
        </button>
        <div>
          <img
            className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
            src={profileData.image || assets.upload_area}
            alt=""
          />
        </div>

        <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {profileData.name}
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <p className="text-gray-600 font-medium">Email:</p>
            <p className="text-gray-600">{profileData.email}</p>
            <p className="text-gray-600 font-medium">Phone:</p>
            <p className="text-gray-600">{profileData.phone}</p>
            <p className="text-gray-600 font-medium">Gender:</p>
            <p className="text-gray-600">{profileData.gender}</p>
            <p className="text-gray-600 font-medium">DOB:</p>
            <p className="text-gray-600">{profileData.dob}</p>
            <p className="text-gray-600 font-medium">Address:</p>
            <p className="text-gray-600">{profileData.address?.line1} {profileData.address?.line2}</p>
          </div>
        </div>

        <div className="mt-8">
          <p className="mb-3 text-xl font-medium text-gray-700">Appointment History</p>
          <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
            <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr] grid-flow-col py-3 px-6 border-b bg-gray-50">
              <p>#</p>
              <p>Doctor</p>
              <p>Date & Time</p>
              <p>Status</p>
            </div>
            {patientAppointments.length > 0 ? (
              patientAppointments.map((item, index) => (
                <div
                  className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
                  key={index}
                >
                  <p className="max-sm:hidden">{index + 1}</p>
                  <div className="flex items-center gap-2">
                    <img className="w-8 rounded-full" src={item.docData.image} alt="" />
                    <p>{item.docData.name}</p>
                  </div>
                  <p>{item.slotDate}, {item.slotTime}</p>
                  <div>
                    {item.cancelled ? (
                      <span className="text-red-500 text-xs font-medium">Cancelled by {item.cancelledBy}</span>
                    ) : item.isCompleted ? (
                      <span className="text-green-500 text-xs font-medium">Completed</span>
                    ) : item.isAccepted ? (
                      <span className="text-blue-500 text-xs font-medium">Accepted</span>
                    ) : (
                      <span className="text-gray-500 text-xs font-medium">Pending</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">No appointments found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPatientProfile;
