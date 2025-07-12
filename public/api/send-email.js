// contact_form_updated/api/send-email.js

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message, recaptchaToken } = req.body;

  // Validate
  if (!name?.trim() || !email?.trim() || !message?.trim() || !recaptchaToken?.trim()) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  // Verify reCAPTCHA
  const params = new URLSearchParams();
  params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
  params.append('response', recaptchaToken);

  const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const result = await recaptchaResponse.json();
  if (!result.success) {
    return res.status(400).json({ error: 'Recaptcha failed.' });
  }

  // Email
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: subject || `New Contact Form Submission`,
    html: `<p>${message}</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Email failed:', err);
    res.status(500).json({ error: 'Email sending failed.' });
  }
}
