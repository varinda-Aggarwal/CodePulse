const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 20000
});
const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"CodePulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify your CodePulse account',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>CodePulse Email Verification</h2>
                <p>Your OTP for account verification is:</p>
                <h1 style="letter-spacing: 4px;">${otp}</h1>
                <p>This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
            </div>
        `
    });
};

module.exports = sendOtpEmail;