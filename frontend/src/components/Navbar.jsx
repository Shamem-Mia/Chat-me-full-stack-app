import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessagesSquare, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  return (
    <header className="bg-gray-800 text-white sticky top-0 z-40 shadow-md border-b border-gray-700 backdrop-blur-lg bg-opacity-90">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left Side - Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-80 transition-all"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessagesSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-lg font-bold">Chat-me</h1>
        </Link>

        {/* Right Side - Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/settings"
            className="btn btn-sm bg-gray-600 text-white flex gap-2 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <Link
                to="/profile"
                className="btn btn-sm bg-gray-600 text-white flex gap-2"
              >
                <User className="size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              <button
                className="flex items-center gap-2 hover:text-red-400 transition-all"
                onClick={logout}
              >
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
