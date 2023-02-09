import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const register = async (req, res) => {

    try {

        const { name, email, password, mobile, parentsMob, roomNo ,branch} = req.body;

        const avatar = req.files.avatar.tempFilePath;

        let user = await User.findOne({ email });

        if (user) {
            return res
                .status(400)
                .json({ success: false, message: "User already exist" });

        }

        const otp = Math.floor(Math.random() * 1000000);


        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "QrAtt/user",
            width: "1080",
            height: "1080"
        });

        fs.rmSync(avatar, { recursive: true });

        user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,
            },
            mobile,
            parentsMob,
            roomNo,
            branch,
            otp,
            otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRE * 60 * 1000),

        });

        await sendMail(email, "Verify your account", otp,user.name);


        sendToken(
            res,
            user
            , 201,
            "OTP has been sent to your email adress, please verify your account"
        );


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const verify = async (req, res) => {
    try {
        const otp = Number(req.body.otp);

        const user = await User.findOne(req.user._id);

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

        const user = await User.findOne({ email }).select("+password");



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

export const logout = async (req, res) => {

    try {
        return res.status(200).cookie("token", null, {
            expires: new Date(Date.now()),
        })
            .json({ success: true, message: "Logout Successful" });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


export const getMyProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user._id);


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

        const user = await User.findById(req.user._id);

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

        const user = await User.findById(req.user._id);

        const avatar = req.files.avatar.tempFilePath;

        if (avatar) {

            await cloudinary.v2.uploader.destroy(user.avatar.public_id);

            const mycloud = await cloudinary.v2.uploader.upload(avatar, {
                folder: "QrAtt/user",
                width: "1080",
                height: "1080",
                crop: "fill"
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

        const user = await User.findById(req.user._id).select("+password");

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
        const user = await User.findOne({ email });

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
        const user = await User.findOne({
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


