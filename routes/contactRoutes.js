const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  }
});

router.post('/send-message', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const mailOptions = {
      from: email,
      to: process.env.EMAIL,
      subject: `Message from ${name}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send('Message sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending message.');
  }
});

module.exports = router;
