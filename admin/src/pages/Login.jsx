import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { AdminContext } from "../context/AdminContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { DoctorContext } from "../context/DoctorContext";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Login = () => {
  const [state, setState] = useState("Admin");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken, dToken } = useContext(DoctorContext);
  const navigate = useNavigate();

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleForgotSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/doctor/forgot-password", { email: forgotEmail });
      if (data.success) {
        toast.success(data.message);
        setForgotStep(1);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleForgotSubmitOtp = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(backendUrl + "/api/doctor/verify-otp", {
        email: forgotEmail,
        otp,
        newPassword
      });
      if (data.success) {
        toast.success(data.message);
        setShowForgotModal(false);
        setForgotStep(0);
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (state === "Admin") {
        const { data } = await axios.post(backendUrl + "/api/admin/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("aToken", data.token);
          await sleep(2000);
          toast.success(data.message);
          setAToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/doctor/login", {
          email,
          password,
        });
        if (data.success) {
          localStorage.setItem("dToken", data.token);
          navigate("/doctor/dashboard");
          await sleep(2000);
          setDToken(data.token);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="min-h-[80vh] flex items-center"
      onSubmit={(event) => onSubmitHandler(event)}
    >
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-lg shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            type="email"
            className="border border-[#DADADA] rounded w-full p-2 mt-1 outline-primary"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="w-full relative">
          <p>Password</p>
          <input
            type={showPassword ? "text" : "password"} // Toggle between text and password
            className="border border-[#DADADA] rounded w-full p-2 mt-1 outline-primary"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <span
            className="absolute right-3 top-11 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)} // Toggle the state
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Toggle text */}
          </span>
        </div>

        <button
          className="bg-primary text-white w-full py-2 rounded-md text-lg flex items-center justify-center gap-2 disabled:opacity-70"
          disabled={loading}
        >
          {loading ? (
            <>
              Loading
              <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
              <div
                className="h-2 w-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="h-2 w-2 rounded-full bg-white animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </>
          ) : (
            "Login"
          )}
        </button>

        {state === "Admin" ? (
          <p className="text-sm font-medium">
            Doctor Login? {""}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Doctor")}
            >
              Click Here
            </span>
          </p>
        ) : (
          <p className="text-sm font-medium">
            Admin Login?{""}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => setState("Admin")}
            >
              Click Here
            </span>
          </p>
        )}

        {state === "Doctor" && (
          <p className="text-sm font-medium mt-2">
            Forgot Password? {""}
            <span
              className="text-primary underline cursor-pointer"
              onClick={() => {
                setShowForgotModal(true);
                setForgotStep(0);
                setForgotEmail("");
                setOtp("");
                setNewPassword("");
              }}
            >
              Reset Here
            </span>
          </p>
        )}
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Reset Password
            </h3>
            {forgotStep === 0 ? (
              <form onSubmit={handleForgotSubmitEmail}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full border rounded p-2 outline-primary"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">
                    Send OTP
                  </button>
                  <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleForgotSubmitOtp}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border rounded p-2 outline-primary"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border rounded p-2 outline-primary"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button type="submit" className="flex-1 bg-primary text-white py-2 rounded">
                    Reset
                  </button>
                  <button type="button" onClick={() => setShowForgotModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default Login;
