const sendGmail = require('./gmailSend');

const sendResetEmail = async (email, resetLink) => {
    await sendGmail({
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