// Sends email via Gmail API using OAuth2 (HTTPS-based, not raw SMTP — raw SMTP connections don't route reliably from this hosting environment).
const getAccessToken = async () => {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
            grant_type: 'refresh_token'
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error_description || 'Failed to refresh Gmail access token');
    }
    return data.access_token;
};

const base64UrlEncode = (str) => {
    return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
};

const sendGmail = async ({ to, subject, html, replyTo }) => {
    const accessToken = await getAccessToken();
    const from = process.env.EMAIL_USER;

    const messageParts = [
        `From: CodePulse <${from}>`,
        `To: ${to}`,
        replyTo ? `Reply-To: ${replyTo}` : null,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html
    ].filter(Boolean).join('\r\n');

    const raw = base64UrlEncode(messageParts);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to send email via Gmail API');
    }
};

module.exports = sendGmail;