import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import fs from "fs";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    if (password.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 4 character!",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "This email already used! please use another email",
      });
    }
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      // create jwt token
      generateToken(newUser._id, res);
      const result = await newUser.save();
      return res.status(201).json({
        success: true,
        message: "successfully signup!",
        data: result,
      });
    }
    res.status(400).json({
      message: "Invalid user data!",
    });
  } catch (error) {
    console.log("Error in signup controller:", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exist! Please signup first",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Wrong password!",
      });
    }
    generateToken(existingUser._id, res);

    return res.status(200).json({
      success: true,
      message: "successfully logged in!",
      data: existingUser,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { magAge: 0 });
    res.status(200).json({
      message: "successfully logged out!",
    });
  } catch (error) {
    console.log("Error in logout controller:", error.message);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const profilePic = req.file;

    if (!profilePic) {
      return res.status(400).json({
        message: "Profile pic is required!",
      });
    }

    const uploadResult = await cloudinary.uploader.upload(profilePic.path);
    console.log(uploadResult);

    const updatedUser = await User.findByIdAndUpdate(
      userId, // Ensure `req.user.id` exists (via authMiddleware)
      { profilePic: uploadResult.secure_url },
      { new: true } // Return updated user
    );

    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      else {
        console.log("\nDeleted file");
      }
    });

    res.json({
      message: "Successfully uploaded",
      profilePicUrl: updatedUser.profilePic, // Send updated profile picture URL
      user: updatedUser,
    });

    // res.status(200).json(updatedUser);
  } catch (error) {
    console.log("Error in uploadProfile controller:", error);
    res.status(500).json({
      message: "Internal server error!",
    });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log(error);
  }
};
