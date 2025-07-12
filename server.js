import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmailHandler from './api/send-email.js';

// Needed to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API route for sending email
app.post('/api/send-email', sendEmailHandler);

// For all other routes, serve your contact form HTML page
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contactform.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
