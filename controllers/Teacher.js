
import { Teacher } from "../models/teachers.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";
import { User } from "../models/users.js";
import { Admin } from "../models/admin.js";
import { Attendence } from "../models/attendence.js";

export const register = async (req, res) => {

    try {

        const { name, email, password, mobile } = req.body;

        const avatar = req.files.avatar.tempFilePath;


        let user = await Teacher.findOne({ email });

        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "User already exists" });

        }

        const otp = Math.floor(Math.random() * 1000000);

        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "QrAtt/teacher",
            width: "1080",
            height: "1080"
        });

        fs.rmSync(avatar, { recursive: true });

        user = await Teacher.create({
            name,
            email,
            password,
            avatar: {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,
            },
            mobile,
            otp,
            otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),

        });


        await sendMail(email, "Verify your account", otp,user.name);

        sendToken(
            res,
            user
            , 201,
            "OTP sent to your email ,plese verify your account"
        );


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verify = async (req, res) => {
    try {
        const otp = Number(req.body.otp);

        const user = await Teacher.findOne(req.user._id);

        if (user.otp !== otp || user.otp_expiry < new Date()) {
            return res.status(400).json({ success: false, message: "Invalid OTP or OTP has been expired !" });
        }
        
        user.verified = true;
        user.otp_expiry = null;
        user.otp = null;

        await user.save();

        sendToken(res, user, 200, "Account verified");

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }
}

export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing email or password" });
        }

        const user = await Teacher.findOne({ email }).select("+password");



        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password !" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password!" });
        }

        sendToken(
            res,
            user,
            200,
            "Login Successful"

        );


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const expoPushToken = async (req, res) => {
    try {

        const user = await Teacher.findById(req.user._id);

        const { token } = req.body;

        if (token) {

            if(user.token === null){
                user.token = token;
                await user.save()
                return res.status(200).json({ success: true, message: "Token added Successfully" });

            }
        
            if(user.token !== token){
                user.token = token;
                await user.save()
                return res.status(200).json({ success: true, message: "Token updated Successfully" });
            }

            if(user.token === token){
                return res.status(200).json({ success: true, message: "Token already exist" });
            }
        } 
        
        return res.status(400).json({ success: false, message: "Token not provided" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getMyProfile = async (req, res) => {

    try {

        const user = await Teacher.findById(req.user._id);

        sendToken(
            res,
            user,
            201,
            `Welcome back ${user.name}!`
        );


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateName = async (req, res) => {
    try {

        const user = await Teacher.findById(req.user._id);

        const { name } = req.body;
        if (name) user.name = name;
        await user.save()

        res.status(200).json({ success: true, message: "Name Updated Successfully" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updateAvatar = async (req, res) => {
    try {

        const user = await Teacher.findById(req.user._id);

        const avatar = req.files.avatar.tempFilePath;

        if (avatar) {

            await cloudinary.v2.uploader.destroy(user.avatar.public_id);
          
            const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "QrAtt/teacher",
                width: "1080",
                height: "1080",
                crop: "limit"
            });

            fs.rmSync(avatar, { recursive: true });

            user.avatar = {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,

            }
        }

        await user.save()
        res.status(200).json({ success: true, message: "Profile Updated Successfully" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const updatePassword = async (req, res) => {
    try {

        const user = await Teacher.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "Please enter all fields" });
        };

        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid old password" });
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({ success: true, message: "Password Updated Successfully" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Teacher.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid email" });

        }

        const otp = Math.floor(Math.random() * 1000000);

        user.resetPasswordOtp = otp;
        user.resetPasswordOtpExpiry = Date.now() + 10 * 60 * 1000;
        await user.save();

        await sendMail(email, "Request for Reseting Otp", `Your OTP is ${otp}`
        );



        res.status(200).json({ success: true, message: `OTP sent to ${email}` });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { otp, newPassword } = req.body;
        const user = await Teacher.findOne({
            resetPasswordOtp: otp,
            resetPasswordOtpExpiry: { $gt: Date.now() },
        }).select('+password');

        if (!user) {
            return res.status(400).json({ success: false, message: "OTP Invalid or has been expired" });
        }

        user.password = newPassword;
        user.resetPasswordOtp = null;
        user.resetPasswordOtpExpiry = null;
        await user.save();

        res.status(200).json({ success: true, message: `Password changed successfully!` });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getTeacher = async (req, res) => {
    try {

        const user = await Teacher.find();
        let data = [];

        user.forEach(fun);
        function fun(item, index) {
            if (item.isTeacher) {
                data[index] = {
                    id: item._id,
                    name: item.name,
                    mobile: item.mobile,
                    avatar: item.avatar,
                };
            }
        }

        res.status(200).json({ success: true, data });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getUser = async (req, res) => {
    try {

        const user = await Teacher.findById(req.user._id);
        if (!user.isTeacher) {
            return res.status(400).json({ success: false, message: "You are not able to access this" });
        }

        const userData = await User.find();
        let data = [];

        userData.forEach(fun);
        function fun(item, index) {
            data[index] = {
                id: item._id,
                name: item.name,
                email: item.email,
                mobile: item.mobile,
                parentsMob: item.parentsMob,
                roomNo: item.roomNo,
                avatar: item.avatar,
            };
        }

        res.status(200).json({ success: true, data });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getUserById = async (req, res) => {
    try {

       

        const {userid} = req.params;

        const user = await Teacher.findById(req.user._id);
        if (!user.isTeacher) {
            return res.status(400).json({ success: false, message: "You are not able to access this" });
        }

        const userData = await User.findById(userid);
        
        res.status(200).json({ success: true, userData });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getSpecificUser = async (req, res) => {
    
    try {
        const user = await Teacher.findById(req.user._id);
        if (!user.isTeacher) {
            return res.status(400).json({ success: false, message: "You are not able to access this" });
        }


       const data = await User.find({
            $or: [
                { name: { $regex: req.params.key, $options: "i" } },
            ]
        });


        res.status(200).json({ success: true ,data});


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


// ADMIN ACCESS

export const AdminReg = async (req, res) => {

    //     try {

    //      // const {name,email,password,mobile} = req.body;

    //         const avatar = req.files.avatar.tempFilePath;


    //        // let user = await Teacher.findOne({email});

    //         // if(user){
    //         //     return res
    //         //     .status(400)
    //         //     .json({success:false , message: "User already exists"});

    //         // }

    //       // const otp = Math.floor(Math.random() * 1000000 );

    //         const mycloud = await cloudinary.v2.uploader.upload(avatar,{
    //             folder:"QrAtt/Admin",
    //             width:"1080",
    //             height:"1080"
    //           });

    //           fs.rmSync("./tmp",{recursive:true});

    //       const  user = await Admin.create({
    //             name:"Admin",
    //             email:"qratt.noreply@gmail.com",
    //             password:"Password@QrAtt",
    //             avatar:{
    //                 public_id:mycloud.public_id,
    //                 url:mycloud.secure_url,
    //             },
    //             mobile:1234567890,
    //             isAdmin:true,
    //             verified:true,
    //             otp:null,
    //             otp_expiry:null,

    //         });


    //    //  await sendMail(email, "Verify your account", `Your OTP is ${otp}`);

    //      sendToken(
    //         res,
    //         user
    //         ,201,
    //         "OTP sent to your email ,plese verify your account"
    //         );


    //     } catch (error) {
    //       res.status(400).json({success:false, message: error.message});
    //     }
    return res.status(400).json({ success: false, message: "Access Denied" });
}

export const AdminLogin = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Missing email or password" });
        }

        const user = await Admin.findOne({ email }).select("+password");


        if (!user) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password !" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid email or password!" });
        }

        sendToken(
            res,
            user,
            200,
            "Login Successful"

        );


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verifyTeacher = async (req, res) => {

    try {
        const { teacherId } = req.params;
        const teacher = await Teacher.findById(teacherId)
        const user = await Admin.findById(req.user._id);

        if (user.isAdmin) {

            if (teacher) {
                teacher.isTeacher = true;
                await teacher.save();
                return res.status(200).json({ success: true, message: "User Verified" });
            }
            return res.status(400).json({ success: false, message: "Cannot Find User" });
        };

        return res.status(400).json({ success: false, message: "Access Denied" });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}