import React, { useState, useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Contact = () => {
  const { backendUrl, userData } = useContext(AppContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(backendUrl + "/api/user/submit-query", {
        userId: userData ? userData._id : "",
        name,
        email,
        message,
      });
      if (data.success) {
        toast.success(data.message);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center text-2xl pt-10  text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>
      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-md">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.contact_image}
          alt=""
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-xl text-gray-600">OUR OFFICE</p>
          <p className="text-gray-500">
            Gooba Garden <br />
            IIT Kanpur, Uttar Pradesh-208016
          </p>
          <p className="text-gray-500">
            Tel:+91 69696-96971 <br />
            Email: akadbakad@gmail.com{" "}
          </p>
          <p className="font-semibold text-lg text-gray-600">
            CAREERS AT Health Center
          </p>
          <p className="text-gray-500">
            Hume hi nhi mila toh aapko kaise milega :)
          </p>
          <button className="border border-black px-8 py-4 text-md hover:bg-black hover:text-white transition-all duration-500">
            Explore Jobs
          </button>
        </div>
      </div>

      {/* Query Form */}
      <div className="max-w-2xl mx-auto border rounded p-8 mb-20 shadow-sm">
        <p className="text-2xl text-gray-600 font-semibold mb-6">Send Us A Message</p>
        <form onSubmit={onSubmitHandler} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded p-2 outline-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded p-2 outline-primary"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border rounded p-2 outline-primary min-h-[120px]"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white py-3 rounded-md mt-2 disabled:opacity-70 hover:opacity-90 transition-all"
          >
            {loading ? "Sending..." : "Submit Query"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
