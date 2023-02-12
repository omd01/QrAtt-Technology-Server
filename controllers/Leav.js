import { Leav } from "../models/leav.js";
import { Teacher } from "../models/teachers.js";
import { User } from "../models/users.js";
import axios from "axios";

export const newLeav = async (req, res) => {

    try {

        const { teacher, reason,from,to } = req.body;
        const AssignedTeacher = await Teacher.findById(teacher);
        const user = await User.findById(req.user._id);
        const leav = await Leav.create({
            userId: user._id,
            name: user.name,
            teacher,
            reason,
            from ,
            to,
            status: "pending",
            createdAt: new Date(Date.now()),

        });
        if (leav) {
            res.status(200).json({ success: true, message: "Leav Request sent successfully " });

            await axios.post("https://exp.host/--/api/v2/push/send", {
                to: AssignedTeacher.token,
                title: "🟡 New Leave Request",
                body: "You have a new leave request from " + user.name,
            })
        }



    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const myLeav = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user){
            const teacher = await Teacher.findById(req.user._id);
            if(!teacher.isTeacher){
                return res.status(400).json({ success: false, message: "You are not able to access this page" });
            }
            const leav = await Leav.find({ teacher: teacher._id });
                if (leav[0]) {
                  return res.status(200).json({ success: true, message:"Success",data:leav});

                }
                return res.status(200).json({ success: false});

            }


        const leav = await Leav.find({userId: user._id });

        if (leav[0]) {
           return res.status(200).json({ success: true, message:"Success",data:leav});
        }
        return res.status(200).json({ success: true,data:[],message:null});
        
       


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const cancelLeav = async (req, res) => {

    try {

        const { leavId } = req.params;

        const leav = await Leav.findById(leavId);

        if (leav.status == "approved") {
            return res.status(400).json({ success: false, message: "Approved Leav Cannot Deleted" });
        }
        const dlt = await Leav.findByIdAndRemove(leavId);
        
        if (!dlt) {
            return res.status(400).json({ success: false, message: "Cannot Find Request" });
        }

        res.status(200).json({ success: true, message: "Request removed successfully" });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const approveLeav = async (req, res) => {

    try {

        const { leavId } = req.params;
  
        const user = await Teacher.findById(req.user._id);


        if (user.isTeacher) {
            const leav = await Leav.findById(leavId);
            const student = await User.findById(leav.userId);
            if (leav) {
                leav.status = "approved";
                await leav.save();

                await axios.post("https://exp.host/--/api/v2/push/send", {
                    to: student.token,
                    title: "🟢 Leave Request Approved ",
                    body: "Your leave request was approved by " + user.name,
                })
                
                return res.status(200).json({ success: true, message: "Request Approved" });

            }
            return res.status(400).json({ success: false, message: "Cannot Find Request" });
        };

        return res.status(400).json({ success: false, message: "Access Denied" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const rejectLeav = async (req, res) => {

    try {

        const { leavId } = req.params;

        const leav = await Leav.findById(leavId);

        const user = await Teacher.findById(req.user._id);

        if (!user.isTeacher) {
            return res.status(400).json({ success: false, message: "Access Denied" });

        };

        if (leav) {
            const student = await User.findById(leav.userId);
            leav.status = "rejected";
            await leav.save();
            await axios.post("https://exp.host/--/api/v2/push/send", {
                    to: student.token,
                    title: "🔴 Leave Request Rejected ",
                    body: "Your leave request was rejected by " + user.name,
                })
            return res.status(200).json({ success: true, message: "Request Rejected" });
        }


        res.status(400).json({ success: false, message: "Cannot Find Request" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}