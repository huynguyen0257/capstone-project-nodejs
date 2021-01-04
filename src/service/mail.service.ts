import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export class MailService {
  private transporter: Mail;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "testmailbusiness1412@gmail.com",
        pass: "!QAZxsw2",
      },
    });
  }
  sendMail(mailContent: Mail.Options) {
    this.transporter.sendMail(mailContent, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  }
}