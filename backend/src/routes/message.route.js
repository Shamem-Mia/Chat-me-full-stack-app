import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessages,
} from "../controllers/message.controller.js";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

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

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", upload.single("image"), protectRoute, sendMessages);

// , upload.array("image", 15)

export default router;
