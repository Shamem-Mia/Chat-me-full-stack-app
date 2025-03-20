import express from "express";
import {
  login,
  logout,
  signup,
  updateProfile,
  checkAuth,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import multer from "multer";
const router = express.Router();
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const random = uuidv4();
    cb(null, random + "" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.put(
  "/update-profile",
  upload.single("profilePic"),
  protectRoute,
  updateProfile
);
router.get("/check", protectRoute, checkAuth);

export default router;
