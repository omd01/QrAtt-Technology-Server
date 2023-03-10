import { Attendence } from "../models/attendence.js";
import { User } from "../models/users.js";
import { Teacher } from "../models/teachers.js";
import fs from "fs";
import cloudinary from "cloudinary";
import XLSX from "xlsx";
import schedule from "node-schedule";
import { sendXlsx } from "../utils/sendMail.js";
import axios from "axios";

export const Attend = async (req, res) => {
  try {
    const allTeacher = await Teacher.find({ isTeacher: true });
    var teacherDevices = [];

    allTeacher.map((item) => {
      teacherDevices.push(item.token);
    });

    const user = await User.findOne(req.user._id);

    const { gate, action, uniqueCode } = req.body;

    const avatar = req.files.avatar.tempFilePath;

    if (process.env.UNIQUE_CODE !== uniqueCode) {
      fs.rmSync(avatar, { recursive: true });

      const failed_att = await Attendence.create({
        userId: user._id,
        name: user.name,
        gate,
        action,
        uniqueCode,
        selfi: {
          public_id: null,
          url: null,
        },
        status: "failed",
        gender: user.gender,
        actionAt: new Date(),
      });

      if (failed_att) {
        await axios.post("https://exp.host/--/api/v2/push/send", {
          to: teacherDevices,
          title: "❌ wrong Qr scaned",
          body: `suspicious activity deteced by ${user.name}`,
          channelId: "wrong_qr",
        });
        return res
          .status(400)
          .json({ success: false, message: "Use Scaned Wrong QR code!" });
      }
    }

    const mycloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "QrAtt/Attendence",
      width: "1080",
      height: "1080",
    });

    fs.rmSync(avatar, { recursive: true });

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
      status: "success",
      gender: user.gender,
      actionAt: new Date(),
    });

    if (att) {
      return res
        .status(200)
        .json({ success: true, message: `${action} Success!` });
    }

    res.status(400).json({
      success: false,
      message: `Somthing went wrong please try again or scan correct QR code`,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAttendence = async (req, res) => {
  try {
    const user = await Teacher.findOne(req.user._id);

    if (user.isTeacher == null || !user.isTeacher) {
      return res.status(400).json({ success: false, message: "Access Denied" });
    }

    const data = await Attendence.find({});

    return res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyAttendence = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id);

    if (!user) {
      return res.status(400).json({ success: false, message: "Access Denied" });
    }

    const Olddata = await Attendence.find({});

    var data = [];

    Olddata.forEach((element) => {
      if (element.userId == user._id) {
        data.push({
          _id: element._id,
          gate: element.gate,
          action: element.action,
          actionAt: element.actionAt,
          status: element.status,
        });
      }
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const user = await Teacher.findById(req.user._id);
    if (!user.isTeacher) {
      return res
        .status(400)
        .json({ success: false, message: "You are not able to access this" });
    }

    const allAttendance = await Attendence.find();

    var boys_data;
    var girls_data;

    var hostel_boys_chcek_in = 0;
    var hostel_boys_chcek_out = 0;
    var main_gate_boys_chcek_in = 0;
    var main_gate_boys_chcek_out = 0;

    var hostel_girls_chcek_in = 0;
    var hostel_girls_chcek_out = 0;
    var main_gate_girls_chcek_in = 0;
    var main_gate_girls_chcek_out = 0;

    const today = new Date().toISOString().split("T")[0];

    allAttendance.forEach((element) => {
      if (JSON.stringify(element.actionAt).split("T")[0].slice(1) === today) {
        if(element.status === "success"){
        if (element.gender === "male") {
          if (element.gate === "Hostel Gate" && element.action === "check-in") {
            hostel_boys_chcek_in = hostel_boys_chcek_in + 1;
            // console.log(element);
          } else if (
            element.gate === "Hostel Gate" &&
            element.action === "check-out"
          ) {
            hostel_boys_chcek_out = hostel_boys_chcek_out + 1;
          } else if (
            element.gate === "Main Gate" &&
            element.action === "check-in"
          ) {
            main_gate_boys_chcek_in = main_gate_boys_chcek_in + 1;
          } else if (
            element.gate === "Main Gate" &&
            element.action === "check-out"
          ) {
            main_gate_boys_chcek_out = main_gate_boys_chcek_out + 1;
          }
        } else if (element.gender === "female") {
          if (element.gate === "Hostel Gate" && element.action === "check-in") {
            hostel_girls_chcek_in = hostel_girls_chcek_in + 1;
          } else if (
            element.gate === "Hostel Gate" &&
            element.action === "check-out"
          ) {
            hostel_girls_chcek_out = hostel_girls_chcek_out + 1;
          } else if (
            element.gate === "Main Gate" &&
            element.action === "check-in"
          ) {
            main_gate_girls_chcek_in = main_gate_girls_chcek_in + 1;
          } else if (
            element.gate === "Main Gate" &&
            element.action === "check-out"
          ) {
            main_gate_girls_chcek_out = main_gate_girls_chcek_out + 1;
          }
        }}
      }
    });

    boys_data = [
      { hostel_boys_chcek_in },
      { hostel_boys_chcek_out },
      { main_gate_boys_chcek_in },
      { main_gate_boys_chcek_out },
    ];

    girls_data = [
      { hostel_girls_chcek_in },
      { hostel_girls_chcek_out },
      { main_gate_girls_chcek_in },
      { main_gate_girls_chcek_out },
    ];

    return res.status(200).json({ success: true, boys_data, girls_data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete Cloud images for User ( 1 hour ):---------
schedule.scheduleJob("0 0 */1 * * * ", async () => {
  try {
    var UserData = [];
    var CloudData = [];
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: "QrAtt/user",
    });

    if (result) {
      result.resources.forEach((element) => {
        CloudData.push(element.public_id);
      });

      const user = await User.find();
      user.forEach((element) => {
        UserData.push(element.avatar.public_id);
      });
    }
    const DltData = CloudData.filter((link) => {
      return !UserData.find((element) => {
        return element === link;
      });
    });
    DltData.forEach(async (element) => {
      await cloudinary.v2.uploader.destroy(element);
    });
    console.log("teacher");
  } catch (error) {
    console.log(error);
  }
});

// Delete Cloud images for Teacher (1 hour):------
schedule.scheduleJob("0 0 */1 * * * ", async () => {
  try {
    var UserData = [];
    var CloudData = [];
    const result = await cloudinary.v2.api.resources({
      type: "upload",
      prefix: "QrAtt/teacher",
    });

    if (result) {
      result.resources.forEach((element) => {
        CloudData.push(element.public_id);
      });

      const user = await Teacher.find();
      user.forEach((element) => {
        UserData.push(element.avatar.public_id);
      });
    }
    const DltData = CloudData.filter((link) => {
      return !UserData.find((element) => {
        return element === link;
      });
    });
    DltData.forEach(async (element) => {
      await cloudinary.v2.uploader.destroy(element);
    });
    console.log("user");
  } catch (error) {
    console.log(error);
  }
});

//Delete Non Verified account in time (10 minuits):-----
schedule.scheduleJob("0 */10 * * * * ", async () => {
  try {
    const user = await User.find();
    user.forEach((element) => {
      if (!element.verified) {
        if (element.otp_expiry < new Date(Date.now())) {
          async function dlt() {
            await User.findByIdAndRemove(element._id);
          }
          dlt();
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//Send XLSX file to teachers (1 Month):-------
schedule.scheduleJob("0 0 0 0 */1 *", async () => {
  try {
    var data = [];

    const attendence = await Attendence.find();

    attendence.forEach((item, index) => {
      data[index] = {
        Id: item.userId,
        Name: item.name,
        Gate: item.gate,
        Action: item.action,
        Date: item.actionAt.toLocaleDateString(),
        Time: item.actionAt.toLocaleTimeString(),
        UniqueCode: item.uniqueCode,
        Selfi: item.selfi.url,
      };
    });

    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workBook, workSheet, "attendence");
    fs.mkdirSync("xlsx", (err) => console.log(err));
    XLSX.writeFile(workBook, "xlsx/sheet1.xlsx");

    await sendXlsx();
    fs.rmSync("./xlsx", { recursive: true });

    console.log("XLSX");
  } catch (error) {
    console.log(error);
  }
});
