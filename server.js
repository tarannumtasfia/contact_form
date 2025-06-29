require('dotenv').config();
const express = require('express');
// Removed deep-email-validator import
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

// Simple email validation using regex
function simpleEmailCheck(email) {
  return /\S+@\S+\.\S+/.test(email);
}

// reCAPTCHA verification
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
  console.log('Recaptcha verification response:', result); // Debugging
  return result.success;
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email sending route
app.post('/send-email', async (req, res) => {
  const { name, email, message, recaptchaToken } = req.body;

  if (!name?.trim()) return res.status(400).json({ error: 'Name is required.' });
  if (!email?.trim()) return res.status(400).json({ error: 'Email is required.' });
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
  if (!recaptchaToken?.trim()) return res.status(400).json({ error: 'Recaptcha token is missing.' });

  // Use simple regex validation instead of deep-email-validator
  if (!simpleEmailCheck(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  let recaptchaSuccess = false;
  try {
    recaptchaSuccess = await verifyRecaptcha(recaptchaToken);
  } catch (error) {
    console.error('Error verifying recaptcha:', error);
    return res.status(500).json({ error: 'Recaptcha verification error.' });
  }
  if (!recaptchaSuccess) {
    return res.status(400).json({ error: 'Recaptcha verification failed.' });
  }

  // Compose and send email
  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER,
    subject: `New Contact Form Message from ${name}`,
    html: `
      <h3>You've received a new message from your contact form:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br>${message}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
