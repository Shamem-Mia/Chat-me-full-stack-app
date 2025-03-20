import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("A user is connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    // If the user already exists, add the new socket ID
    if (userSocketMap[userId]) {
      userSocketMap[userId].push(socket.id);
    } else {
      userSocketMap[userId] = [socket.id];
    }
  }
  // emit is used to send events to the all the  connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  //  Listen for new messages and send notification
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    console.log(`Message from ${senderId} to ${receiverId}: ${message}`);

    // Get the receiver's socket IDs
    const receiverSockets = userSocketMap[receiverId];

    if (receiverSockets?.length) {
      //  Send notification only once (not per socket connection)
      io.to(receiverSockets[0]).emit("receiveNotification", {
        senderId,
        message,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user is disconnected", socket.id);

    if (userId) {
      // Remove the disconnected socket ID
      userSocketMap[userId] = userSocketMap[userId]?.filter(
        (id) => id !== socket.id
      );

      // If no sockets left, remove the user
      if (userSocketMap[userId]?.length === 0) {
        delete userSocketMap[userId];
      }
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
