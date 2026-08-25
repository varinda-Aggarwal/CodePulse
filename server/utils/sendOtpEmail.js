const sendOtpEmail = async (email, otp) => {
    const response = await fetch('https://api.mailersend.com/v1/email', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.MAILERSEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: { email: process.env.MAILERSEND_SENDER_EMAIL, name: 'CodePulse' },
            to: [{ email }],
            subject: 'Verify your CodePulse account',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>CodePulse Email Verification</h2>
                    <p>Your OTP for account verification is:</p>
                    <h1 style="letter-spacing: 4px;">${otp}</h1>
                    <p>This OTP is valid for 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send OTP email');
    }
};

module.exports = sendOtpEmail;