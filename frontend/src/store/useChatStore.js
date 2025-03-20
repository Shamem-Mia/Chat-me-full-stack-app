import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.filteredUser || [] });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData) => {
    const { selectedUser, messages } = get();
    const socket = useAuthStore.getState().socket;
    set((state) => ({
      messages: [...state.messages, messageData],
    }));
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      //  Send the message through WebSocket
      socket.emit("sendMessage", {
        senderId: useAuthStore.getState().authUser._id,
        receiverId: selectedUser._id,
        message: messageData.text,
      });

      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      set({
        messages: [...get().messages, newMessage],
      });
    });

    // Listen for notifications and show toast
    socket.on("receiveNotification", ({ senderId, newMessage }) => {
      if (selectedUser._id !== senderId) {
        toast.success(`📩 New message from ${senderId}:  ${newMessage}`);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
