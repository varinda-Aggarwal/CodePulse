const sendGmail = require('./gmailSend');

const sendSupportEmail = async ({ type, name, email, subject, message, category, priority }) => {
    const typeLabels = {
        contact: '📩 New Contact Message',
        bug: '🐞 New Bug Report',
        feature: '💡 New Feature Suggestion'
    };

    await sendGmail({
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `${typeLabels[type]}: ${subject}`,
        html: `
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
    });
};

module.exports = sendSupportEmail;