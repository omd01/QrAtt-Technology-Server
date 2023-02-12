import express from 'express'; 
import { getTeacher } from '../controllers/Teacher.js';
import {  expoPushToken, forgetPassword, getMyProfile, login, logout, register, resetPassword, updateAvatar, updateName, updatePassword, updateRoom, verify } from '../controllers/User.js';
import { isAuthenticated } from '../middlewares/auth.js';


const router = express.Router();

// Student 
router.route("/register").post(register); 
router.route("/verify").post(isAuthenticated ,verify); 
router.route("/login").post(login); 
router.route("/setexpotoken").put(isAuthenticated ,expoPushToken); 
router.route("/me").get(isAuthenticated , getMyProfile); 
router.route("/updatename").put(isAuthenticated , updateName); 
router.route("/updateroom").put(isAuthenticated , updateRoom); 
router.route("/updateavatar").put(isAuthenticated , updateAvatar); 
router.route("/updatepassword").put(isAuthenticated , updatePassword); 
router.route("/forgetpassword").post(forgetPassword); 
router.route("/resetpassword").post(resetPassword); 

//Common
router.route("/logout").get(logout); 
router.route("/getteacher").get(getTeacher); 


export default router;
