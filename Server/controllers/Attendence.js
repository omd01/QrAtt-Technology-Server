import { Attendence } from "../models/attendence.js"
import { User } from "../models/users.js";
import { Teacher } from "../models/teachers.js";
import fs from "fs";
import cloudinary from "cloudinary";
import XLSX from 'xlsx';
import { sendXlsx } from "../utils/sendMail.js";

export const Attend = async (req, res) => {

    try {

        const user = await User.findOne(req.user._id);

        const { gate, action, uniqueCode } = req.body;

        const avatar = req.files.avatar.tempFilePath;

        if (process.env.UNIQUE_CODE !== uniqueCode) {
            return res.status(400).json({ success: false, error: "Wrong QR code" });
        }

        const mycloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "QrAtt/Attendence",
            width: "1080",
            height: "1080"
        });

        fs.rmSync("./tmp", { recursive: true });

        const att = await Attendence.create({
            userId: user._id,
            name: user.name,
            gate,
            action,
            uniqueCode,
            selfi: {
                public_id: mycloud.public_id,
                url: mycloud.secure_url,
            },
            actionAt: new Date()
            // date: `${new Date().getDate()}:${new Date().getMonth()}:${new Date().getFullYear()}`,
            // time:`${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        });

        if (att) {
            return res.status(200).json({ success: true, message: `${action} Success!` });
        }

        res.status(400).json({ success: false, message: `Use Scaned Wrong QR code!` });


    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

export const getAttendence = async (req, res) => {

    try {

        const user = await Teacher.findOne(req.user._id);

        if (user.isTeacher == null || !user.isTeacher) {
            return res.status(400).json({ success: false, message: "Access Denied" });
        }

        const data = await Attendence.find({})

        return res.status(200).json({ success: true, data });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//elete Cloud images for Teacher

setInterval(async function () {

    try {
        var UserData = [];
        var CloudData = [];
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'QrAtt/user'
        });

        if (result) {
            result.resources.forEach(element => {
                CloudData.push(element.public_id)
            });

            const user = await User.find();
            user.forEach(element => {
                UserData.push(element.avatar.public_id);
            });

        }
        const DltData = CloudData.filter((link) => {
            return !UserData.find((element) => {
                return element === link
            });
        })
        DltData.forEach(async (element) => {
            await cloudinary.v2.uploader.destroy(element);
        })
    }
    catch (error) {
        console.log(error)
    }

}, 60 * 60 * 1000);

//elete Cloud images for User

setInterval(async function () {

    try {
        var UserData = [];
        var CloudData = [];
        const result = await cloudinary.v2.api.resources({
            type: 'upload',
            prefix: 'QrAtt/teacher'
        });

        if (result) {
            result.resources.forEach(element => {
                CloudData.push(element.public_id)
            });

            const user = await Teacher.find();
            user.forEach(element => {
                UserData.push(element.avatar.public_id);
            });

        }
        const DltData = CloudData.filter((link) => {
            return !UserData.find((element) => {
                return element === link
            });
        })
        DltData.forEach(async (element) => {
            await cloudinary.v2.uploader.destroy(element);
        })
        console.log("user")
    }
    catch (error) {
        console.log(error)
    }

}, 60 * 60 * 1000);

//elete Non Verified account in time

setInterval(async function () {

    try {
        const user = await User.find();
        user.forEach(element => {
            if (!element.verified) {
                if (element.otp_expiry < new Date(Date.now())) {
                    async function dlt() {
                        await User.findByIdAndRemove(element._id)
                    }
                    dlt()
                }
            }
        });
    }
    catch (error) {
        console.log(error)
    }

}, 60 * 60 * 1000);

setInterval(async function () {

    try {

        var data = [];

        const attendence = await Attendence.find();

        function attTime(date) {
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            var strTime = `${hours}:${minutes}:${seconds} ${ampm}`;
            return strTime;
        }
    

        attendence.forEach((item, index) => {

            data[index] = {
                Id: item.userId,
                Name: item.name,
                Gate: item.gate,
                Action: item.action,
                Date: `${item.actionAt.getDate()}/${item.actionAt.getMonth()}/${item.actionAt.getFullYear()}`,
                Time: attTime(item.actionAt),
                UniqueCode: item.uniqueCode,
                Selfi: item.selfi.url
            }

        });

        const workSheet = XLSX.utils.json_to_sheet(data);
        const workBook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workBook, workSheet, "attendence");
        fs.mkdirSync("xlsx", (err) => console.log(err))
        XLSX.writeFile(workBook, "xlsx/sheet1.xlsx")

        await sendXlsx()

         fs.rmSync("./xlsx",{recursive:true})
    }
    catch (error) {
        console.log(error)
    }

}, 10 * 1000);

