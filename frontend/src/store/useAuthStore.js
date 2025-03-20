import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore.js";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in useAuthStore:", error);

      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  logout: async () => {
    try {
      let n;
      n = confirm("Do you want to logged out?");
      if (n) {
        await axiosInstance.post("/auth/logout");
        set({ authUser: null });
        toast.success("Logged out successfully");
        get().disConnectSocket();
      } else {
        toast.error("Not logged out");
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const formData = new FormData();
      formData.append("profilePic", data.profilePic);
      const res = await axiosInstance.put("/auth/update-profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!res.data || !res.data.user || !res.data.user.profilePic) {
        throw new Error("Invalid response from server");
      }

      set({ authUser: res.data });

      toast.success("Profile updated successfully");
      return res.data;
    } catch (error) {
      console.log("Error in update profile", error);
      toast.error("Internal server error");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;
    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
      transports: ["websocket"],
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    //  Listen for message notifications
    socket.on("receiveNotification", ({ senderId, message }) => {
      const { users } = useChatStore.getState();
      const sender = users.find((user) => user._id === senderId);

      if (sender) {
        toast.success(`📩 New message from ${sender.fullName}: ${message}`);
      } else {
        toast.success(`📩 New message from ${senderId}: ${message}`);
      }
    });
  },
  disConnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
  },
}));
