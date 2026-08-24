const sendOtpEmail = async (email, otp) => {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: { name: 'CodePulse', email: process.env.EMAIL_USER },
            to: [{ email }],
            subject: 'Verify your CodePulse account',
            htmlContent: `
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