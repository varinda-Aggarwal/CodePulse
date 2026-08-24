const sendSupportEmail = async ({ type, name, email, subject, message, category, priority }) => {
    const typeLabels = {
        contact: '📩 New Contact Message',
        bug: '🐞 New Bug Report',
        feature: '💡 New Feature Suggestion'
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: { name: 'CodePulse Support', email: process.env.EMAIL_USER },
            to: [{ email: process.env.EMAIL_USER }],
            replyTo: email ? { email } : undefined,
            subject: `${typeLabels[type]}: ${subject}`,
            htmlContent: `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2>${typeLabels[type]}</h2>
                    ${name ? `<p><strong>From:</strong> ${name}</p>` : ''}
                    ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                    ${category ? `<p><strong>Category:</strong> ${category}</p>` : ''}
                    ${priority ? `<p><strong>Priority:</strong> ${priority}</p>` : ''}
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap; background:#f4f4f4; padding:12px; border-radius:8px;">${message}</p>
                </div>
            `
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send support email');
    }
};

module.exports = sendSupportEmail;