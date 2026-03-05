const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// -----------------------------------------------------------------------
// Multi-transport email sender
// Priority: 1) Resend API (HTTPS, never blocked by Azure)
//           2) Gmail SMTP port 465 (SSL)
//           3) Gmail SMTP port 587 (STARTTLS)
// -----------------------------------------------------------------------

let resendClient = null;
let smtpTransporter465 = null;
let smtpTransporter587 = null;

const getResend = () => {
    const key = process.env.RESEND_API_KEY;
    if (!key || key.startsWith('your_')) return null;
    if (!resendClient) resendClient = new Resend(key);
    return resendClient;
};

const getSMTP = (port) => {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
    if (!emailUser || !emailPass) return null;

    if (port === 465) {
        if (!smtpTransporter465) {
            smtpTransporter465 = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: emailUser, pass: emailPass },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
                socketTimeout: 12000,
                tls: { rejectUnauthorized: false }
            });
        }
        return smtpTransporter465;
    }

    if (!smtpTransporter587) {
        smtpTransporter587 = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: { user: emailUser, pass: emailPass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 12000,
            tls: { rejectUnauthorized: false }
        });
    }
    return smtpTransporter587;
};

// Email Templates
const templates = {
    // Welcome Email for Creators
    welcomeCreator: (name) => ({
        subject: '🎉 Welcome to TheCollabify - Start Your Creator Journey!',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 14px; }
        .checklist { background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .checklist-item { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Welcome to TheCollabify!</h1>
        </div>
        <div class="content">
            <h2>Hey ${name}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                We're thrilled to have you join our community of amazing creators! You're now part of India's #1 influencer marketing platform where brands find their perfect creator matches.
            </p>
            
            <div class="checklist">
                <h3 style="margin-top: 0;">📋 Complete Your Profile:</h3>
                <div class="checklist-item">✅ Add your Instagram handle</div>
                <div class="checklist-item">✅ Upload a profile picture</div>
                <div class="checklist-item">✅ Write a compelling bio</div>
                <div class="checklist-item">✅ Set your pricing range</div>
                <div class="checklist-item">✅ Browse available campaigns</div>
            </div>

            <p style="font-size: 16px; color: #333;">
                <strong>🎯 What's Next?</strong><br>
                Complete your profile to unlock AI-powered campaign matching and start earning from your influence!
            </p>

            <center>
                <a href="https://thecollabify.tech/creator/dashboard" class="button">
                    Complete Your Profile →
                </a>
            </center>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
                💡 <strong>Pro Tip:</strong> Creators with complete profiles get 5x more campaign invitations!
            </p>
        </div>
        <div class="footer">
            <p>TheCollabify - Empowering Influencer Partnerships</p>
            <p>
                <a href="https://thecollabify.tech" style="color: #8b5cf6; text-decoration: none;">Website</a> | 
                <a href="https://thecollabify.tech/privacy" style="color: #8b5cf6; text-decoration: none;">Privacy</a> | 
                <a href="mailto:support@thecollabify.com" style="color: #8b5cf6; text-decoration: none;">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Registration OTP Email
    registrationOTP: (data) => ({
        subject: `Your OTP Code - TheCollabify`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333; max-width: 500px; margin: 0 auto;">
                    <h1 style="color: #8b5cf6; text-align: center;">✨ TheCollabify</h1>
                    <p>Hi ${data.name},</p>
                    <p>Your verification code is:</p>
                    <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: white;">${data.otpCode}</span>
                    </div>
                    <p>This code is valid for 10 minutes. 🔒 Never share this code with anyone.</p>
                    <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
                        © ${new Date().getFullYear()} TheCollabify
                    </div>
                </div>
            </div>
        `
    }),

    // Welcome Email for Sellers
    welcomeSeller: (name) => ({
        subject: '🚀 Welcome to TheCollabify - Find Your Perfect Creators!',
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; margin: 20px 0; }
        .footer { background: #1a1a1a; color: #888; padding: 30px; text-align: center; font-size: 14px; }
        .feature-box { background: #f9fafb; padding: 20px; border-left: 4px solid #8b5cf6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Welcome to TheCollabify!</h1>
        </div>
        <div class="content">
            <h2>Hello ${name}! 👋</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
                Welcome to India's smartest influencer marketing platform! You can now discover and collaborate with thousands of talented creators who perfectly match your brand.
            </p>
            
            <div class="feature-box">
                <h4 style="margin: 0 0 10px 0;">🤖 AI-Powered Matching</h4>
                <p style="margin: 0; color: #666;">Our smart algorithm finds creators that perfectly align with your brand values and audience.</p>
            </div>
            
            <div class="feature-box">
                <h4 style="margin: 0 0 10px 0;">📊 Real-Time Analytics</h4>
                <p style="margin: 0; color: #666;">Track campaign performance, ROI, and creator engagement in real-time.</p>
            </div>
            
            <div class="feature-box">
                <h4 style="margin: 0 0 10px 0;">💬 Direct Communication</h4>
                <p style="margin: 0; color: #666;">Chat instantly with creators, share briefs, and manage everything in one place.</p>
            </div>

            <center>
                <a href="https://thecollabify.tech/seller/dashboard" class="button">
                    Create Your First Campaign →
                </a>
            </center>

            <p style="font-size: 14px; color: #666; margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
                💡 <strong>Quick Start:</strong> Create a campaign in under 2 minutes and start receiving applications from matched creators immediately!
            </p>
        </div>
        <div class="footer">
            <p>TheCollabify - Empowering Influencer Partnerships</p>
            <p>
                <a href="https://thecollabify.tech" style="color: #8b5cf6; text-decoration: none;">Website</a> | 
                <a href="https://thecollabify.tech/privacy" style="color: #8b5cf6; text-decoration: none;">Privacy</a> | 
                <a href="mailto:support@thecollabify.com" style="color: #8b5cf6; text-decoration: none;">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Campaign Application Received (to Seller)
    applicationReceived: (brandName, creatorName, campaignTitle) => ({
        subject: `🎯 New Application: ${creatorName} applied to "${campaignTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #8b5cf6; }
        .stat-label { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📬 New Campaign Application!</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333;">
                Great news, ${brandName}! <strong>${creatorName}</strong> has applied to your campaign <strong>"${campaignTitle}"</strong>.
            </p>
            
            <center>
                <a href="https://thecollabify.tech/seller/dashboard" class="button">
                    Review Application →
                </a>
            </center>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                ⏱️ Tip: Responding within 24 hours increases acceptance rates by 60%!
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Application Status Update (to Creator)
    applicationStatus: (creatorName, campaignTitle, status, brandName) => ({
        subject: status === 'accepted'
            ? `✅ Congratulations! Your application was accepted`
            : `📋 Update on your application to "${campaignTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: ${status === 'accepted' ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'}; padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${status === 'accepted' ? '🎉 Application Accepted!' : '📋 Application Update'}</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333;">
                Hi ${creatorName},
            </p>
            ${status === 'accepted' ? `
                <p style="font-size: 16px; color: #333;">
                    <strong>Congratulations!</strong> ${brandName} has accepted your application for <strong>"${campaignTitle}"</strong>! 🎊
                </p>
                <p style="font-size: 14px; color: #666;">
                    Next steps:
                    <br>1. Message the brand to discuss details
                    <br>2. Review campaign requirements
                    <br>3. Start creating amazing content!
                </p>
                <center>
                    <a href="https://thecollabify.tech/creator/dashboard" class="button">
                        View Campaign Details →
                    </a>
                </center>
            ` : `
                <p style="font-size: 16px; color: #333;">
                    Your application to <strong>"${campaignTitle}"</strong> by ${brandName} has been updated to: <strong>${status}</strong>.
                </p>
                <center>
                    <a href="https://thecollabify.tech/creator/dashboard" class="button">
                        View All Applications →
                    </a>
                </center>
            `}
        </div>
    </div>
</body>
</html>
        `
    }),

    // Payment Received
    paymentReceived: (creatorName, amount, campaignTitle) => ({
        subject: `💰 Payment Received: ₹${amount} for "${campaignTitle}"`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); padding: 40px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .amount-box { background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 30px; text-align: center; margin: 20px 0; }
        .amount { font-size: 48px; font-weight: bold; color: #10b981; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 Payment Received!</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333;">
                Awesome work, ${creatorName}! 🎉
            </p>
            
            <div class="amount-box">
                <p style="margin: 0; color: #666;">You've earned</p>
                <div class="amount">₹${amount}</div>
                <p style="margin: 0; color: #666;">for "${campaignTitle}"</p>
            </div>

            <p style="font-size: 14px; color: #666;">
                The payment has been processed and will be transferred to your account within 2-3 business days.
            </p>

            <center>
                <a href="https://thecollabify.tech/creator/dashboard" class="button">
                    View Earnings Dashboard →
                </a>
            </center>

            <p style="font-size: 14px; color: #666; margin-top: 30px; padding: 15px; background: #fef3c7; border-radius: 8px;">
               ⭐ Keep up the great work! Consistent performers get priority access to premium campaigns.
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Weekly Summary
    weeklySummary: (name, stats) => ({
        subject: `📊 Your Weekly Summary - ${stats.campaigns} campaigns, ${stats.earnings} earned`,
        html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-card { background: #f9fafb; padding: 20px; border-radius: 10px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #8b5cf6; }
        .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
        .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Your Week at a Glance</h1>
        </div>
        <div class="content">
            <p style="font-size: 16px; color: #333;">
                Hey ${name}! Here's how your week went on TheCollabify:
            </p>
            
            <div class="stat-grid">
                <div class="stat-card">
                    <div class="stat-value">${stats.campaigns}</div>
                    <div class="stat-label">Active Campaigns</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.earnings}</div>
                    <div class="stat-label">Total Earnings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.applications}</div>
                    <div class="stat-label">New Applications</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${stats.messages}</div>
                    <div class="stat-label">Messages</div>
                </div>
            </div>

            <center>
                <a href="https://thecollabify.tech" class="button">
                    View Full Dashboard →
                </a>
            </center>

            <p style="font-size: 14px; color: #666; margin-top: 20px;">
                Keep up the momentum! 🚀
            </p>
        </div>
    </div>
</body>
</html>
        `
    }),

    // Creator Application Received (to Seller)
    creatorApplied: (data) => ({
        subject: `New Creator Application: ${data.creatorName}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #8b5cf6;">🎯 New Application!</h2>
                    <p>Hi ${data.sellerName},</p>
                    <p><strong>${data.creatorName}</strong> has applied to your promotion: <strong>"${data.promotionTitle}"</strong></p>
                    <p>Log in to your dashboard to review their profile.</p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/seller/dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Application</a>
                    </div>
                </div>
            </div>
        `
    }),

    // Creator Accepted (to Creator)
    creatorAccepted: (data) => ({
        subject: `Congratulations! You've been accepted!`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #10b981;">🎊 You're Accepted!</h2>
                    <p>Hi ${data.creatorName},</p>
                    <p>Great news! <strong>${data.sellerName}</strong> has accepted your application for: <strong>"${data.promotionTitle}"</strong></p>
                    <p>You can now start collaborating!</p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/creator/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Working</a>
                    </div>
                </div>
            </div>
        `
    }),

    // New Match Notification
    newMatch: (data) => ({
        subject: `New Opportunity: ${data.matchScore}% Match!`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #8b5cf6;">🚀 New Match!</h2>
                    <p>Hi ${data.creatorName},</p>
                    <p>A new ${data.category} promotion matches your profile with a <strong>${data.matchScore}% score</strong>:</p>
                    <p><strong>"${data.promotionTitle}"</strong></p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/creator/dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Apply Now</a>
                    </div>
                </div>
            </div>
        `
    })
};

// Send email function — tries Resend (HTTPS), then SMTP 465, then SMTP 587
// NEVER throws — always returns a result object
const sendEmail = async (to, templateName, data) => {
    const template = templates[templateName];
    if (!template) {
        console.error(`[Email] Template "${templateName}" not found`);
        return { success: false, error: `Template "${templateName}" not found` };
    }

    const emailContent = typeof template === 'function' ? template(data) : template;
    const fromEmail = process.env.EMAIL_USER || 'thecollabify1108@gmail.com';
    const fromName = 'TheCollabify';

    // --- Attempt 1: Resend API (works on Azure, uses HTTPS port 443) ---
    const resend = getResend();
    if (resend) {
        try {
            const result = await resend.emails.send({
                from: `${fromName} <${process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'}>`,
                to,
                subject: emailContent.subject,
                html: emailContent.html
            });
            console.log('[Email/Resend] Sent to', to, '- id:', result.data?.id);
            return { success: true, provider: 'resend', id: result.data?.id };
        } catch (err) {
            console.warn('[Email/Resend] Failed, trying SMTP:', err.message);
        }
    }

    // --- Attempt 2: Gmail SMTP port 465 (SSL) ---
    const smtpMailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject: emailContent.subject,
        html: emailContent.html
    };

    const smtp465 = getSMTP(465);
    if (smtp465) {
        try {
            const sendP = smtp465.sendMail(smtpMailOptions);
            const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP 465 timed out')), 13000));
            const info = await Promise.race([sendP, timeout]);
            console.log('[Email/SMTP-465] Sent to', to, '-', info.messageId);
            return { success: true, provider: 'smtp-465', messageId: info.messageId };
        } catch (err) {
            console.warn('[Email/SMTP-465] Failed, trying port 587:', err.message);
            smtpTransporter465 = null; // reset bad connection
        }
    }

    // --- Attempt 3: Gmail SMTP port 587 (STARTTLS) ---
    const smtp587 = getSMTP(587);
    if (smtp587) {
        try {
            const sendP = smtp587.sendMail(smtpMailOptions);
            const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('SMTP 587 timed out')), 13000));
            const info = await Promise.race([sendP, timeout]);
            console.log('[Email/SMTP-587] Sent to', to, '-', info.messageId);
            return { success: true, provider: 'smtp-587', messageId: info.messageId };
        } catch (err) {
            console.warn('[Email/SMTP-587] Failed:', err.message);
            smtpTransporter587 = null; // reset bad connection
        }
    }

    console.error(`[Email] ALL transports failed for "${templateName}" to ${to}`);
    return { success: false, error: 'All email transports failed' };
};

module.exports = {
    sendEmail,
    templates
};
