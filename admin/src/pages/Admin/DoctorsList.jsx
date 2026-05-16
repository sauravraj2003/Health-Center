import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import { useNavigate } from "react-router-dom";

const DoctorsList = () => {
  const { doctors, aToken, getAllDoctors, changeAvailability, removeDoctor } =
    useContext(AdminContext);
  const navigate = useNavigate();
  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken]);

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-2xl font-medium">All Doctors</h1>
      <div className="flex flex-wrap w-full gap-4 pt-5 gap-y-6">
        {doctors.map((item, index) => (
          <div
            className="border border-indigo-200 rounded-xl max-w-56 overflow-hidden cursor-pointer"
            key={index}
            onClick={() => navigate(`/doctor-profile/${item._id}`)}
          >
            <img
              className="bg-indigo-50 hover:bg-primary transition-all duration-500 w-full h-64 object-cover"
              src={item.image}
              alt=""
            />
            <div className="p-4">
              <p className="text-neutral-800 text-lg font-medium">
                {item.name}
              </p>
              <p className="text-zinc-600 text-sm">{item.speciality}</p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => changeAvailability(item._id)}
                    id={`available${item._id}`}
                  />
                  <label onClick={(e) => e.stopPropagation()} htmlFor={`available${item._id}`}>Available</label>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm("Are you sure you want to remove this doctor?")) {
                      removeDoctor(item._id);
                    }
                  }}
                  className="text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorsList;
