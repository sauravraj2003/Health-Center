import React, { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";

const PatientReports = () => {
  const { aToken, backendUrl } = useContext(AdminContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [reportName, setReportName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/users", {
        headers: { aToken },
      });
      if (data.success) {
        setUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const fetchUserReports = async (userId) => {
    try {
      const { data } = await axios.get(
        backendUrl + "/api/admin/user-reports/" + userId,
        {
          headers: { aToken },
        }
      );
      if (data.success) {
        setReports(data.reports);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const uploadReport = async (e) => {
    e.preventDefault();
    if (!file || !reportName || !selectedUser) {
      return toast.warn("Please provide all details");
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("userId", selectedUser._id);
    formData.append("name", reportName);
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/upload-report",
        formData,
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        setFile(null);
        setReportName("");
        fetchUserReports(selectedUser._id);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteReport = async (reportId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-report",
        { reportId },
        { headers: { aToken } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchUserReports(selectedUser._id);
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
      fetchUsers();
    }
  }, [aToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      {!selectedUser ? (
        <>
          <p className="mb-3 text-lg font-medium">Patient Reports Management</p>
          <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
            <div className="hidden sm:grid grid-cols-[0.5fr_2fr_2fr_1fr] grid-flow-col py-3 px-6 border-b">
              <p>#</p>
              <p>Name</p>
              <p>Email</p>
              <p>Action</p>
            </div>

            {users.map((item, index) => (
              <div
                className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_2fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
                key={index}
              >
                <p className="max-sm:hidden">{index + 1}</p>
                <p>{item.name}</p>
                <p>{item.email}</p>
                <button
                  onClick={() => {
                    setSelectedUser(item);
                    fetchUserReports(item._id);
                  }}
                  className="bg-primary text-white hover:bg-primary-dark px-3 py-1 rounded"
                >
                  Manage Reports
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-lg font-medium">
              Reports for: <span className="text-primary">{selectedUser.name}</span>
            </p>
            <button
              onClick={() => {
                setSelectedUser(null);
                setReports([]);
              }}
              className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-300"
            >
              Back to Patients
            </button>
          </div>

          {/* Upload Section */}
          <div className="mb-8 border border-gray-300 p-6 rounded-lg bg-white shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload New Document for {selectedUser.name}</h3>
            <form onSubmit={uploadReport} className="flex flex-col sm:flex-row gap-4 items-center">
              <input
                type="text"
                placeholder="Report Name (e.g. X-Ray Result)"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                className="border border-gray-300 rounded p-2 flex-1 outline-primary w-full"
                required
              />
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png,.dcm"
                className="border border-gray-300 bg-gray-50 rounded p-1.5 flex-1 w-full"
                required
              />
              <button
                type="submit"
                disabled={isUploading}
                className="bg-primary text-white py-2 px-6 rounded hover:bg-primary-dark transition-all duration-300 min-w-32 flex justify-center disabled:opacity-70"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </div>

          {/* Reports List */}
          <div>
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                  <div key={report._id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white flex flex-col justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg truncate">{report.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Uploaded on: {new Date(report.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <a
                        href={report.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-indigo-50 text-indigo-600 border border-indigo-200 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                      >
                        View
                      </a>
                      <button
                        onClick={() => deleteReport(report._id)}
                        className="bg-red-50 text-red-500 border border-red-200 px-3 py-1.5 rounded hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mt-4">No reports found for this patient.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientReports;
