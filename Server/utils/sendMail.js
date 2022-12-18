import { createTransport } from 'nodemailer';
import { Teacher } from '../models/teachers.js';
import ejs from "ejs";


export const sendMail = async (email, subject, text) => {
    const transport = createTransport({
        service: 'gmail',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,

        },
    });


    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        text,
    });
}

export const sendXlsx = async () => {
    const transport = createTransport({
        service: 'gmail',
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,

        },
    });

    const teacher = await Teacher.find();
    var email = [];
    const subject = "test mail to text it works or not";
    const text = "test text for xlsx files";
    const filename = `${new Date().getDate()}-${new Date().getMonth()}-${new Date().getFullYear()}-sheet.xlsx`
    teacher.forEach(item => {
        email.push(item.email);
    })

    var html
    var link = "om.com"
   ejs.renderFile( './templates/xlsxmail.ejs', { link }, async (err, data) => {
    html = data;
   })


    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject,
        html,
        attachments: [
            {
                filename: filename,
                path: "./xlsx/sheet1.xlsx",
                cid: "unique-data.xlsx"
            }
        ]
    });
}




