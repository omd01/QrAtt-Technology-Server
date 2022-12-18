import express from 'express'; 
import { approveLeav, cancelLeav, myLeav, newLeav, rejectLeav } from '../controllers/Leav.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

//Leav 
router.route("/newleav").post(isAuthenticated ,newLeav); 
router.route("/myleav").get(isAuthenticated ,myLeav); 
router.route("/delete/:leavId").delete(isAuthenticated ,cancelLeav); 
router.route("/approve/:leavId").get(isAuthenticated ,approveLeav); 
router.route("/reject/:leavId").get(isAuthenticated , rejectLeav); 

export default router;
