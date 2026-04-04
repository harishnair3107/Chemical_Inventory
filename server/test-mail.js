const nodemailer = require('nodemailer');
require('dotenv').config();

const test = async () => {
    console.log('Testing with email:', process.env.EMAIL_USER);
    console.log('Testing with pass (mask):', process.env.EMAIL_PASS ? '******' : 'MISSING');

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        await transporter.verify();
        console.log('Transporter is ready');
        
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Mail',
            text: 'If you see this, nodemailer is working!'
        });
        console.log('Test mail sent successfully');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

test();
