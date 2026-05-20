// Uses EmailJS Templates API
// Uses the contact template: template_aasdnak (via env)

/* eslint-disable */
async function sendContactEmail({
    toEmail,
    name,
    email,
    phone,
    country,
    subject,
    message,
}) {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_CONTACT_TEMPLATE_ID || 'template_aasdnak';
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    // Force recipient to marketing inbox (config-driven)
    toEmail = process.env.MARKETING_INBOX_EMAIL || toEmail || 'marketing@provisa.com.np';


    if (!serviceId || !templateId || !publicKey) {
        console.warn(
            '[emailjs] Missing EmailJS env vars for contact. Set EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, EMAILJS_PUBLIC_KEY.'
        );
        return { ok: false, reason: 'missing-config' };
    }

    // Provide multiple possible variable names because EmailJS templates differ.
    // This prevents “email sent but message body is blank”.
    const params = {
        to_email: toEmail || email,
        name: name || '',
        email: email || '',
        phone: phone || '',
        country: country || '',
        subject: subject || '',

        // Primary expected names
        message: message || '',
        msg: message || '',
        content: message || '',
        question: message || '',
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: params,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        return { ok: false, status: res.status, body: text };
    }

    return { ok: true, body: text };
}

module.exports = { sendContactEmail };

