import nodemailer from 'nodemailer';
import fetch from 'node-fetch';

export default async function handler(req, res) {
 

  const { name, email, subject, message, recaptchaToken } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  // if (!recaptchaToken?.trim()) {
  //   res.status(400).json({ error: 'Recaptcha token is missing.' });
  //   return;
  // }

  // // Verify reCAPTCHA
  // async function verifyRecaptcha(token) {
  //   const params = new URLSearchParams();
  //   params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
  //   params.append('response', token);

  //   const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //     body: params.toString(),
  //   });

  //   const result = await response.json();
  //   return result.success;
  // }

  // try {
  //   const recaptchaSuccess = await verifyRecaptcha(recaptchaToken);
  //   if (!recaptchaSuccess) {
  //     res.status(400).json({ error: 'Recaptcha verification failed.' });
  //     return;
  //   }
  // } catch (error) {
  //   res.status(500).json({ error: 'Recaptcha verification error.' });
  //   return;
  // }

  // Setup nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: subject || `New Contact Form Message from ${name}`,
    html: `
      <h3>You've received a new message:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
}
