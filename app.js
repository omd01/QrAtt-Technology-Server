import express  from "express";
import User from "./routers/User.js";
import Teacher from "./routers/Teacher.js";
import Leav from "./routers/Leav.js";
import Attendence from "./routers/Attendence.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
export const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
    limits:{fileSize: 50 * 1024 * 1024},
    useTempFiles : true,
}))
app.use(cors());

app.use("/api/v1", User);
app.use("/api/v1/teacher", Teacher);
app.use("/api/v1/leav", Leav);
app.use("/api/v1/attendence", Attendence);

app.get("/", (req, res) => {
    res.send("Welcom To QrAll Technology")
})


