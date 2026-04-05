const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    },
    // Force IPv4 to avoid ENETUNREACH errors on some cloud providers
    addressFamily: 4,
    logger: true,
    debug: true
});

const sendOtpMail = async (email, otp, subject = 'Admin Login OTP', body = 'Your OTP for Chemical Inventory Management Admin login is:') => {
    // Reload environment variables for safety
    dotenv.config();

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Missing EMAIL_USER or EMAIL_PASS environment variables!');
        return false;
    }

    const mailOptions = {
        from: `"Chemical Inventory Admin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: `${body} ${otp}. It will expire in 10 minutes.`
    };

    try {
        console.log(`--- MAIL DIAGNOSTIC ---`);
        console.log(`Target Email: ${email}`);
        console.log(`Sender User: ${process.env.EMAIL_USER}`);
        console.log(`Attempting SMTP handshake...`);
        
        // Use the global transporter or re-verify if needed
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
