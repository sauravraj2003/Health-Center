import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { AppContext } from "../../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";

const PatientsList = () => {
  const { aToken, users, getAllUsers } = useContext(AdminContext);
  const { calculateAge } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) {
      getAllUsers();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Patients</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_2fr_2fr_1fr] grid-flow-col py-3 px-6 border-b hover:bg-gray-50">
          <p>#</p>
          <p>Patient Info</p>
          <p>Email</p>
          <p>Phone</p>
          <p>Age</p>
        </div>
        {users &&
          users.map((item, index) => (
            <div
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_2fr_2fr_1fr] items-center text-gray-500 py-3 px-6 border-b cursor-pointer hover:bg-gray-100"
              key={index}
              onClick={() => navigate(`/patient-profile/${item._id}`)}
            >
              <p className="max-sm:hidden">{index + 1}</p>
              <div className="flex items-center gap-2">
                <img
                  className="w-8 h-8 rounded-full object-cover bg-gray-200"
                  src={item.image || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                  alt=""
                />
                <p>{item.name}</p>
              </div>
              <p>{item.email}</p>
              <p>{item.phone || "N/A"}</p>
              <p className="max-sm:hidden">{item.dob ? calculateAge(item.dob) : "N/A"}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PatientsList;
