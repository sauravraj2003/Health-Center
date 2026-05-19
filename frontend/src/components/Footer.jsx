import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* Left Section */}
        <div>
          <img src={assets.logo} alt="Health Center Logo" className="mb-5 w-40" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            {`Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.`}
          </p>
        </div>
        {/* Center Section */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary">Home</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary">About us</Link></li>
            <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary">Contact us</Link></li>
            <li><Link to="/my-reports" onClick={() => window.scrollTo(0, 0)} className="hover:text-primary">My Reports</Link></li>
          </ul>
        </div>
        {/* Right Section */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91-69696-96971</li>
            <li>akadbakad@gmail.com</li>
          </ul>
        </div>
      </div>
      <div>
        {/* Copyright Text */}
        <hr />
        <p className="py-5 text-sm text-center">
          Copyright 2024@ Health Center - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
