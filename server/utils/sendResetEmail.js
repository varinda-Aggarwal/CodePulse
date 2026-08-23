const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    connectionTimeout: 20000
});

const sendResetEmail = async (email, resetLink) => {
    await transporter.sendMail({
        from: `"CodePulse" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset your CodePulse password',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Reset Your Password</h2>
                <p>Click the button below to set a new password. This link is valid for 15 minutes.</p>
                <a href="${resetLink}" style="display:inline-block; background:#2563eb; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:10px;">
                    Reset Password
                </a>
                <p style="margin-top:20px; color:#666;">If you didn't request this, please ignore this email.</p>
            </div>
        `
    });
};

module.exports = sendResetEmail;