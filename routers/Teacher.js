import express from "express";

import {
  AdminLogin,
  AdminReg,
  getSpecificUser,
  getUser,
  expoPushToken,
  forgetPassword,
  getMyProfile,
  login,
  register,
  resetPassword,
  updateAvatar,
  updateName,
  updatePassword,
  verify,
  verifyTeacher,
} from "../controllers/Teacher.js";

import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Teacher
router.route("/register").post(register);
router.route("/verify/:link").get(isAuthenticated, verify);
router.route("/login").post(login);
router.route("/setexpotoken").put(isAuthenticated, expoPushToken);
router.route("/me").get(isAuthenticated, getMyProfile);
router.route("/updatename").put(isAuthenticated, updateName);
router.route("/updateavatar").put(isAuthenticated, updateAvatar);
router.route("/updatepassword").put(isAuthenticated, updatePassword);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword").post(resetPassword);
router.route("/getuser").get(isAuthenticated, getUser);
router.route("/getspecificuser").get(isAuthenticated, getSpecificUser);

router.route("/admin").post(AdminReg);
router.route("/admin/login").post(AdminLogin);
router.route("/admin/verify/:teacherId").get(isAuthenticated, verifyTeacher);

export default router;
