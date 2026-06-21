/**
 * Netlify Function: send-contact
 * Handles contact form submissions by sending emails via Resend API.
 * Sends notifications to both the admin and the form submitter.
 */

const RESEND_API_URL = 'https://api.resend.com/emails';
const ADMIN_EMAIL = 'info@sisuai.net';
const FROM_ADDRESS = 'Sisu AI <info@sisuai.net>';

/**
 * Build HTML email body for the admin notification
 */
function buildAdminEmailHtml({ name, email, company, website, message, budget }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%); padding: 32px 40px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px; }
    .body { padding: 36px 40px; }
    .field { margin-bottom: 20px; }
    .label { font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .value { font-size: 15px; color: #0B1120; font-weight: 500; }
    .message-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 4px; color: #0B1120; font-size: 15px; line-height: 1.6; white-space: pre-wrap; }
    .divider { border: none; border-top: 1px solid #E2E8F0; margin: 24px 0; }
    .footer { padding: 20px 40px; background: #F8FAFC; text-align: center; font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>New Contact Form Submission</h1>
      <p>A new lead has filled out the contact form on sisuai.net</p>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">Name</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${escapeHtml(email)}" style="color:#3B82F6;">${escapeHtml(email)}</a></div>
      </div>
      <div class="field">
        <div class="label">Company</div>
        <div class="value">${escapeHtml(company || '—')}</div>
      </div>
      <div class="field">
        <div class="label">Company Website</div>
        <div class="value">${website ? `<a href="${escapeHtml(website)}" style="color:#3B82F6;" target="_blank">${escapeHtml(website)}</a>` : '—'}</div>
      </div>
      <div class="field">
        <div class="label">Budget</div>
        <div class="value">${escapeHtml(budget || '—')}</div>
      </div>
      <hr class="divider">
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">${escapeHtml(message)}</div>
      </div>
    </div>
    <div class="footer">
      Sisu AI &bull; info@sisuai.net &bull; sisuai.net
    </div>
  </div>
</body>
</html>
    `.trim();
}

/**
 * Build HTML confirmation email for the form submitter
 */
function buildConfirmationEmailHtml({ name }) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Inter', Arial, sans-serif; background: #F8FAFC; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%); padding: 40px 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0 0 8px; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 0; font-size: 15px; }
    .body { padding: 40px; }
    .body p { color: #475569; line-height: 1.7; font-size: 15px; margin-bottom: 16px; }
    .body p:last-child { margin-bottom: 0; }
    .highlight { color: #0B1120; font-weight: 600; }
    .cta-box { background: linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(6,182,212,0.08) 100%); border: 1px solid rgba(59,130,246,0.15); border-radius: 12px; padding: 24px 28px; margin: 28px 0; }
    .cta-box p { color: #1e40af; font-weight: 500; margin: 0; font-size: 14px; }
    .footer { padding: 24px 40px; background: #F8FAFC; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { font-size: 12px; color: #94A3B8; margin: 0; }
    .footer a { color: #3B82F6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>We've received your message!</h1>
      <p>Thank you for reaching out to Sisu AI</p>
    </div>
    <div class="body">
      <p>Hi <span class="highlight">${escapeHtml(name)}</span>,</p>
      <p>Thank you for getting in touch with us! We've received your inquiry and are excited to learn more about your business and how we can help transform it with intelligent automation.</p>
      <div class="cta-box">
        <p>⏱ Our team will review your request and get back to you within <strong>1–2 business days</strong>.</p>
      </div>
      <p>In the meantime, feel free to explore more about our AI solutions and the impact we've delivered for businesses like yours at <a href="https://sisuai.net" style="color:#3B82F6;">sisuai.net</a>.</p>
      <p>Looking forward to speaking with you!</p>
      <p><span class="highlight">The Sisu AI Team</span></p>
    </div>
    <div class="footer">
      <p>Sisu AI &bull; <a href="mailto:info@sisuai.net">info@sisuai.net</a> &bull; <a href="https://sisuai.net">sisuai.net</a></p>
      <p style="margin-top:8px;">You are receiving this email because you submitted the contact form on our website.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
}

/** Escape HTML special characters to prevent injection in email templates */
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/** Send a single email via Resend API */
async function sendEmail({ to, subject, html }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set');

    const res = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html }),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Resend API error ${res.status}: ${errorBody}`);
    }

    return res.json();
}

/** Validate required fields and email format */
function validatePayload({ name, email, message }) {
    if (!name || !name.trim()) return 'Name is required';
    if (!email || !email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
    if (!message || !message.trim()) return 'Message is required';
    return null;
}

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const { name, email, company, website, message, budget } = payload;

    const validationError = validatePayload({ name, email, message });
    if (validationError) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: validationError }) };
    }

    try {
        // Send both emails in parallel
        await Promise.all([
            sendEmail({
                to: [ADMIN_EMAIL],
                subject: `New Contact: ${name.trim()} from ${company ? company.trim() : 'Unknown Company'}`,
                html: buildAdminEmailHtml({ name: name.trim(), email: email.trim(), company, website, message: message.trim(), budget }),
            }),
            sendEmail({
                to: [email.trim()],
                subject: 'We received your message — Sisu AI',
                html: buildConfirmationEmailHtml({ name: name.trim() }),
            }),
        ]);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Emails sent successfully' }),
        };
    } catch (err) {
        console.error('Email send error:', err.message);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to send email. Please try again later.' }),
        };
    }
};
