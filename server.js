require('dotenv').config();
const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

// Serve HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

// Verify reCAPTCHA
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
  console.log('🔍 reCAPTCHA verification response:', result);
  return result.success;
}

// Setup transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Handle POST form submission
app.post('/send-email', async (req, res) => {
  const { name, email, message, recaptchaToken } = req.body;

  // Basic validation
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!email?.trim()) return res.status(400).json({ error: 'Email is required.' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
  if (!recaptchaToken?.trim()) return res.status(400).json({ error: 'Recaptcha token is missing.' });

  // Verify reCAPTCHA
  try {
    const recaptchaValid = await verifyRecaptcha(recaptchaToken);
    if (!recaptchaValid) {
      return res.status(400).json({ error: 'Recaptcha verification failed.' });
    }
  } catch (error) {
    console.error('🚫 reCAPTCHA verification error:', error);
    return res.status(500).json({ error: 'Failed to verify recaptcha.' });
  }

  // Send email
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Message from ${name}`,
    html: `
      <h3>New Message from Contact Form</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('🚫 Email sending error:', error);
    return res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
