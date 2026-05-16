import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminContext } from "../../context/AdminContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDoctorProfile = () => {
  const { id } = useParams();
  const { doctors, backendUrl, aToken, getAllDoctors } = useContext(AdminContext);
  const [profileData, setProfileData] = useState(null);
  const [appointmentsPerDay, setAppointmentsPerDay] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (doctors.length > 0) {
      const doc = doctors.find((d) => d._id === id);
      if (doc) {
        setProfileData(doc);
        setAppointmentsPerDay(doc.appointmentsPerDay || 0);
      }
    } else {
      getAllDoctors();
    }
  }, [doctors, id]);

  const updateSettings = async () => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/update-doctor-settings",
        { docId: id, appointmentsPerDay },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        getAllDoctors(); // refresh data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

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
            src={profileData.image}
            alt=""
          />
        </div>

        <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {profileData.name}
          </p>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <p>
              {profileData.degree} - {profileData.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {profileData.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-neutral-800 mt-3">
              About:
            </p>
            <p className="text-sm text-gray-600 max-w-[700px] mt-1">
              {profileData.about}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 max-w-sm">
            <p className="text-gray-600 font-medium">Age:</p>
            <p className="text-gray-600">{profileData.age}</p>
            <p className="text-gray-600 font-medium">Gender:</p>
            <p className="text-gray-600">{profileData.gender}</p>
            <p className="text-gray-600 font-medium">Appointment Fee:</p>
            <p className="text-gray-600">${profileData.fee}</p>
          </div>

          <div className="mt-6 border-t pt-4">
            <p className="text-lg font-medium text-gray-700 mb-4">Admin Settings</p>
            <div className="flex flex-col gap-2 max-w-sm">
              <label className="text-sm text-gray-600">Daily Appointment Limit</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={appointmentsPerDay}
                  onChange={(e) => setAppointmentsPerDay(e.target.value)}
                  className="border rounded px-3 py-2 outline-primary w-full"
                  min="1"
                />
                <button
                  onClick={updateSettings}
                  className="bg-primary text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-600 mb-2">Availability Settings</p>
              <div className="flex gap-2">
                <p className="text-gray-600 font-medium">Auto Accept Appointments:</p>
                <p className={profileData.autoAccept ? "text-green-600" : "text-gray-500"}>
                  {profileData.autoAccept ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctorProfile;
