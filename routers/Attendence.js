import express from 'express'; 
import { Attend, getAttendence, getMyAttendence } from '../controllers/Attendence.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router = express.Router();

//Attendence
router.route("/new").post(isAuthenticated ,Attend); 
router.route("/getattendence").get(isAuthenticated ,getAttendence); 
router.route("/getmyattendence").get(isAuthenticated ,getMyAttendence); 


export default router;
