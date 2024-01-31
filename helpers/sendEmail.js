require("dotenv").config();
const nodemailer = require("nodemailer");

const { MAILTRUP_USER, MAILTRUP_PASSWORD } = process.env;

const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: MAILTRUP_USER,
    pass: MAILTRUP_PASSWORD,
  },
});

function sendEmail(message) {
  return transport.sendMail(message);
}

module.exports = sendEmail;
