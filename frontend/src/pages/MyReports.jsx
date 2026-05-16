import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext.jsx";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const MyReports = () => {
  const { token, backendUrl } = useContext(AppContext);
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [reportName, setReportName] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchReports = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/reports", {
        headers: { token },
      });
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
    if (!file || !reportName) {
      return toast.warn("Please provide a name and select a file.");
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("name", reportName);
    formData.append("file", file);

    try {
      const { data } = await axios.post(
        backendUrl + "/api/user/upload-report",
        formData,
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        setFile(null);
        setReportName("");
        fetchReports();
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
        backendUrl + "/api/user/delete-report",
        { reportId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        fetchReports();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReports();
    }
  }, [token]);

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zin-700 border-b">
        My Reports
      </p>

      {/* Upload Section */}
      <div className="mt-6 mb-8 border border-zinc-300 p-6 rounded-lg bg-zinc-50">
        <h3 className="text-lg font-medium text-neutral-800 mb-4">Upload New Document</h3>
        <form onSubmit={uploadReport} className="flex flex-col sm:flex-row gap-4 items-center">
          <input
            type="text"
            placeholder="Report Name (e.g. X-Ray Result)"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            className="border border-zinc-300 rounded p-2 flex-1 outline-primary w-full sm:w-auto"
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.jpg,.jpeg,.png,.dcm"
            className="border border-zinc-300 bg-white rounded p-1.5 flex-1 w-full sm:w-auto"
            required
          />
          <button
            type="submit"
            disabled={isUploading}
            className="bg-primary text-white py-2 px-6 rounded hover:bg-primary-dark transition-all duration-300 min-w-32 flex justify-center disabled:opacity-70"
          >
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Upload"}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div>
        {reports.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div key={report._id} className="border border-zinc-200 rounded-lg p-5 shadow-sm bg-white flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-neutral-800 text-lg truncate">{report.name}</h4>
                  <p className="text-sm text-zinc-500 mt-1">Uploaded on: {new Date(report.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-3 mt-4">
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center bg-indigo-50 text-indigo-600 border border-indigo-200 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                  >
                    View / Download
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
          <p className="text-zinc-600 mt-4">No reports uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyReports;
