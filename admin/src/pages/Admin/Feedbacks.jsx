import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const Feedbacks = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [feedbacks, setFeedbacks] = useState([]);

  const fetchFeedbacks = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/feedbacks", {
        headers: { aToken },
      });
      if (data.success) {
        setFeedbacks(data.feedbacks);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const deleteFeedback = async (feedbackId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-feedback",
        { feedbackId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchFeedbacks();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (aToken) {
      fetchFeedbacks();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Feedbacks</p>
      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_1fr_1fr_1fr_3fr_0.5fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Date</p>
          <p>Patient</p>
          <p>Doctor</p>
          <p>Review & Rating</p>
          <p>Action</p>
        </div>

        {feedbacks.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_1fr_1fr_1fr_3fr_0.5fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={index}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <p>{new Date(item.date).toLocaleDateString()}</p>
            <p>{item.userName || "Unknown"}</p>
            <p>{item.docName || "Unknown"}</p>
            <div>
              <p className="text-yellow-500 font-bold">{item.rating} / 5</p>
              <p className="text-gray-600 truncate max-w-sm">{item.review}</p>
            </div>
            <button
              onClick={() => deleteFeedback(item._id)}
              className="text-red-500 hover:bg-red-100 px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedbacks;
