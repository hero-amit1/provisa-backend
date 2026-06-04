/* eslint-disable */
// Uses EmailJS Templates API
// https://www.emailjs.com/docs/rest-api/send-email/
//
// Expected environment variables:
// - EMAILJS_SERVICE_ID  (e.g., service_c2umit1)
// - EMAILJS_TEMPLATE_ID (e.g., template_n95q56m)
// - EMAILJS_PUBLIC_KEY  (e.g., rFe-t8EnY2t2wUouN)
//
// Note: Node 18+ has global fetch.

async function sendAppointmentEmail({

    toEmail,
    name,
    email,
    phone,
    country,
    appointmentDate,
}) {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        // Fail silently (we still want appointment to be saved in admin)
        console.warn(
            '[emailjs] Missing EMAILJS_SERVICE_ID/EMAILJS_TEMPLATE_ID/EMAILJS_PUBLIC_KEY'
        );
        return { ok: false, reason: 'missing-config' };
    }

    const params = {
        to_email: toEmail || email,
        name: name || '',
        email: email || '',
        phone: phone || '',
        country: country || '',
        appointment_date: appointmentDate || '',
    };

    const url = 'https://api.emailjs.com/api/v1.0/email/send';
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            service_id: serviceId,
            template_id: templateId,
            user_id: publicKey,
            template_params: params,
        }),
    });

    const text = await res.text();
    if (!res.ok) {
        // Include response body for easier debugging.
        return {
            ok: false,
            status: res.status,
            body: text,
            headers: Object.fromEntries(res.headers?.entries?.() || []),
        };
    }

    return { ok: true, body: text };
}

module.exports = { sendAppointmentEmail };

