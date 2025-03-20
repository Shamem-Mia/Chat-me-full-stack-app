import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUser = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");
    res.status(200).json({ filteredUser });
  } catch (error) {
    console.log("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessage controllers:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};

export const sendMessages = async (req, res) => {
  try {
    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = null;

    // Check if an image is uploaded
    if (req.file) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(req.file.path);
        imageUrl = uploadResponse.secure_url;
      } catch (cloudinaryError) {
        console.log("Cloudinary Upload Error:", cloudinaryError.message);
        return res.status(500).json({ error: "Failed to upload image!" });
      }
    }

    // Ensure message has at least text or an image
    if (!text && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Message must have text or an image!" });
    }

    // Create and save the message
    const newMessage = new Message({
      senderId,
      receiverId,
      text: text || "", // Default empty string if text is missing
      image: imageUrl || "",
    });

    try {
      await newMessage.save();
    } catch (dbError) {
      console.log("Database Save Error:", dbError.message);
      return res.status(500).json({ error: "Failed to save message!" });
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    // Emit notification event to the receiver
    io.to(receiverSocketId).emit("receiveNotification", {
      senderId,
      message: text || "📷 Image message",
    });

    return res.status(200).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error!" });
  }
};
