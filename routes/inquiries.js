/* eslint-disable */
const express = require('express');
// Inquiry model is intentionally not used anymore; we don't store submissions in admin/DB.
// const Inquiry = require('../models/Inquiry');
const { sendAppointmentEmail } = require('../utils/sendAppointmentEmail.cjs');
const { sendContactEmail } = require('../utils/sendContactEmail.js');
const router = express.Router();

// Public POST new inquiry (from forms)
router.post('/', async (req, res) => {
  try {
    // Do NOT store inquiries anymore. Send directly to EmailJS.
    // const inquiry = null; // removed DB save path


    // Send emails:
    // - appointment -> appointment email template
    // - contact -> contact email template
    if (req.body?.type === 'appointment' || req.body?.type === 'contact') {
      const { name, email, phone, country, date, subject, message } = req.body;

      // EmailJS templates will use these variables.
      // Send to marketing inbox (config-driven)
      const toEmail = process.env.MARKETING_INBOX_EMAIL || 'marketing@provisa.com.np';


      const emailPayload = {
        toEmail,
        name,
        email,
        phone,
        country,
        appointmentDate: date,
        subject,
        message,
      };

      // No DB debug since we don't store inquiries anymore.
      // console.log('[email-debug]', emailPayload);

      const templateType = req.body?.type;

      // Send to the correct EmailJS template
      const emailPromise =
        req.body?.type === 'contact'
          ? sendContactEmail({
            ...emailPayload,
            subject,
            message,
          })
          : sendAppointmentEmail({ ...emailPayload, templateType });

      emailPromise
        .then((result) => {
          // sendAppointmentEmail returns { ok:true } on success, otherwise { ok:false, status, body, reason }
          if (!result?.ok) {
            console.warn(`[email] ${req.body?.type} failed:`, result);
          } else {
            console.log(`[email] ${req.body?.type} sent ok`);



            // Helpful log: print missing config reason
            if (result?.reason === 'missing-config') {
              console.warn(
                '[appointment-email] Missing EmailJS env vars. Set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY.'
              );
            }
          }

          // No DB debug since we don't store inquiries anymore.
        })
        .catch((err) => {
          console.warn('[appointment-email] exception:', err?.message || err);

          // No DB debug since we don't store inquiries anymore.
        });
    }

    res
      .status(201)
      .json({ message: 'Inquiry submitted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;


