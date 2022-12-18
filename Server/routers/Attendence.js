import express from 'express'; 
import { Attend, getAttendence } from '../controllers/Attendence.js';
import { isAuthenticated } from '../middlewares/auth.js';
const router = express.Router();

//Attendence
router.route("/new").post(isAuthenticated ,Attend); 
router.route("/getattendence").get(isAuthenticated ,getAttendence); 

export default router;
