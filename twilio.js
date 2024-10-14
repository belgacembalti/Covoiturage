// twilio.js
const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSms = (to, body) => {
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER, // Ton numéro Twilio
    to,
  });
};

module.exports = { sendSms };
