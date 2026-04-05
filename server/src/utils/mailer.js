const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const sendOtpMail = async (email, otp, subject = 'Admin Login OTP', body = 'Your OTP for Chemical Inventory Management Admin login is:') => {
    // Reload environment variables for safety
    dotenv.config();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS environment variables!');
        return false;
    }

    // Creating a fresh transporter inside the function call
    // This uses the 'service: gmail' preset which is often more reliable
    const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 30000,
    debug: true,
    logger: true
});

    const mailOptions = {
        from: `"Chemical Inventory Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `${body} ${otp}. It will expire in 10 minutes.`
    };

    try {
        console.log(`--- MAIL DIAGNOSTIC (Service: Gmail) ---`);
        console.log(`Target Email: ${email}`);
        console.log(`Sender User: ${process.env.EMAIL_USER}`);
        console.log(`Attempting SMTP handshake...`);
        
        await transporter.verify();
        await transporter.sendMail(mailOptions);
        
        console.log('✅ OTP sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Nodemailer Error Details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode,
            message: error.message
        });
        return false;
    }
};

module.exports = { sendOtpMail };
