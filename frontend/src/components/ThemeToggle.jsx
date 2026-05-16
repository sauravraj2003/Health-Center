import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1 border border-gray-200">
      <button
        onClick={() => toggleTheme("light")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          theme === "light" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        Light
      </button>
      <button
        onClick={() => toggleTheme("dark")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          theme === "dark" ? "bg-gray-800 text-white shadow" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => toggleTheme("eye-comfort")}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          theme === "eye-comfort" ? "bg-[#fdeedc] text-[#d48c46] shadow border border-[#fdeedc]" : "text-gray-500 hover:text-gray-800"
        }`}
      >
        Eye
      </button>
    </div>
  );
};

export default ThemeToggle;
