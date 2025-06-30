require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Serve HTML form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  const params = new URLSearchParams();
  params.append('secret', process.env.RECAPTCHA_SECRET_KEY);
  params.append('response', token);

  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const result = await response.json();
  console.log("🔍 Full verification result:", result);
console.log("🔍 Request params:", params.toString());

  // Log the hostname for further debugging
 console.log('🔍 Hostname:', result.hostname);
  return result.success;
}



const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // TLS on 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // helpful on Render
  },
});

// Handle form submission
app.post('/send-email', async (req, res) => {
  const { name, email, subject, message, recaptchaToken } = req.body;
   console.log('Received recaptchaToken:', recaptchaToken);

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!recaptchaToken?.trim()) {
    return res.status(400).json({ error: 'Recaptcha token is missing.' });
  }

  try {
    const recaptchaSuccess = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaSuccess) {
      return res.status(400).json({ error: 'Recaptcha verification failed.' });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Recaptcha verification error.' });
  }

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
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});
app.get('/send-email', (req, res) => {
  res.status(405).json({ error: 'GET not allowed. Use POST.' });
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
