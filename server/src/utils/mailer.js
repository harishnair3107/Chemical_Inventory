const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOtpMail = async (email, otp, subject = 'Admin Login OTP', body = 'Your OTP for Chemical Inventory Management Admin login is:') => {
    // Re-config just in case
    dotenv.config();
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: `${body} ${otp}. It will expire in 10 minutes.`
    };

    try {
        console.log(`Attempting to send OTP to ${email}...`);
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
        return true;
    } catch (error) {
        console.error('Nodemailer Error:', error.message);
        return false;
    }
};

module.exports = { sendOtpMail };
