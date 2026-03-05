const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testEmail() {
    console.log('Testing Email Configuration...');
    console.log('User:', process.env.EMAIL_USER);
    console.log('Pass:', process.env.EMAIL_PASS ? '********' : 'NOT SET');
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('Port:', process.env.EMAIL_PORT);

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
    });

    try {
        console.log('Verifying transporter...');
        await transporter.verify();
        console.log('✅ Transporter is ready');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"TheCollabify Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: "Test Email from TheCollabify",
            text: "This is a test email to verify SMTP configuration.",
            html: "<b>This is a test email to verify SMTP configuration.</b>"
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        if (error.code === 'EAUTH') {
            console.error('Authentication Error: Please check if EMAIL_USER and EMAIL_PASS are correct and if App Passwords are required.');
        }
    }
}

testEmail();
