import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unavailable! No token provided!",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Invalid token!",
      });
    }

    const existingUser = await User.findById(decodedToken.userId).select(
      "-password"
    );
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }
    req.user = existingUser;
    next();
  } catch (error) {
    console.log("Error in auth middleware:", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};
