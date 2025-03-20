import { useState, useEffect } from "react";
import { Sun, Moon, User, Lock, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's going?", isSent: false },
  {
    id: 2,
    content: " I'm going great! Just working on some new features.",
    isSent: true,
  },
];

const SettingsPage = () => {
  const { logout } = useAuthStore();
  // Initialize darkMode state from localStorage or default to false (light mode)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false; // Default to light mode if no saved theme
  });
  // State for active status toggle
  const [isActive, setIsActive] = useState(true);

  // Apply theme mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200 p-4">
      <div className="max-w-md w-full bg-base-100 p-6 rounded-xl shadow-lg space-y-6">
        <h1 className="text-2xl font-semibold text-center">Settings</h1>

        {/* Theme Toggle */}
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            {darkMode ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
            Dark Mode
          </span>
          <input
            type="checkbox"
            className="toggle toggle-neutral text-base-content"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
        </div>

        {/* Active Status Toggle */}
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isActive ? "bg-green-500" : "bg-gray-400"
              }`}
            ></span>
            Active Status
          </span>
          <input
            type="checkbox"
            className="toggle toggle-neutral text-base-content"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
        </div>

        {/* Profile Option */}
        <Link to="/profile">
          <button
            className={`flex items-center w-full px-4 py-3 bg-base-300 rounded-lg hover:bg-gray-300 transition ${
              darkMode ? "hover:bg-base-100" : ""
            }`}
          >
            <User className="w-5 h-5 mr-3" />
            Profile
          </button>
        </Link>

        {/* Change Password */}
        <button
          className={` ${
            darkMode ? "hover:bg-base-100" : ""
          } flex items-center w-full px-4 py-3 bg-base-300 rounded-lg hover:bg-gray-300 transition `}
        >
          <Lock className="w-5 h-5 mr-3" /> Change Password
        </button>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <LogOut className="w-5 h-5 mr-3" /> Log Out
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
