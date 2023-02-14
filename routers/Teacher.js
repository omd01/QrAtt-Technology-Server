import express from "express";

import { AdminLogin, AdminReg, getUser, TexpoPushToken, TforgetPassword, TgetMyProfile, Tlogin, Tregister, TresetPassword, TupdateAvatar, TupdateName, TupdatePassword, Tverify, verifyTeacher } from '../controllers/Teacher.js';

import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Teacher 
router.route("/register").post(Tregister); 
router.route("/verify/:link").get(isAuthenticated ,Tverify); 
router.route("/login").post(Tlogin); 
router.route("/setexpotoken").put(isAuthenticated ,TexpoPushToken); 
router.route("/me").get(isAuthenticated , TgetMyProfile); 
router.route("/updatename").put(isAuthenticated , TupdateName); 
router.route("/updateavatar").put(isAuthenticated , TupdateAvatar); 
router.route("/updatepassword").put(isAuthenticated , TupdatePassword); 
router.route("/forgetpassword").post(TforgetPassword); 
router.route("/resetpassword").post(TresetPassword); 
router.route("/getuser").get(isAuthenticated,getUser);
router.route("/admin").post(AdminReg); 
router.route("/admin/login").post(AdminLogin); 
router.route("/admin/verify/:teacherId").get(isAuthenticated , verifyTeacher); 




export default router;
