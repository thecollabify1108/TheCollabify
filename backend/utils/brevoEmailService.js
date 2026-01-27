const SibApiV3Sdk = require('@sendinblue/client');

// Initialize Brevo (formerly Sendinblue)
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

if (process.env.BREVO_API_KEY) {
    apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
    console.log('✅ Brevo Email Service initialized');
} else {
    console.warn('⚠️ BREVO_API_KEY is missing. OTP emails will fail to send.');
}

/**
 * Send OTP verification email using Brevo
 */
const sendOTPEmail = async (email, name, otpCode) => {
    try {
        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY is missing. Cannot send OTP email.');
        }
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.sender = {
            name: "TheCollabify",
            email: "thecollabify1108@gmail.com" // Verified sender
        };
        sendSmtpEmail.to = [{ email: email, name: name }];
        sendSmtpEmail.subject = "Your OTP Code - TheCollabify";
        sendSmtpEmail.htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #0D0D0D; color: #fff; margin: 0; padding: 40px; }
                    .container { max-width: 600px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; overflow: hidden; }
                    .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .otp-box { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 12px; color: white; margin: 0; font-family: monospace; }
                    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0; color: white;">✨ TheCollabify</h1>
                    </div>
                    <div class="content">
                        <p>Hi <strong>${name}</strong>,</p>
                        <p>Your verification code is:</p>
                        <div class="otp-box">
                            <p class="otp-code">${otpCode}</p>
                        </div>
                        <p>This code is valid for <strong>10 minutes</strong>.</p>
                        <p style="color: #9ca3af; font-size: 14px;">🔒 Never share this code with anyone.</p>
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} TheCollabify</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log('📧 OTP email sent via Brevo to:', email);
        return { success: true };
    } catch (error) {
        console.error('Brevo email error:', error);
        throw new Error('Failed to send OTP email');
    }
};

/**
 * Send notification when creator applies to promotion
 */
const sendCreatorAppliedEmail = async (sellerEmail, sellerName, creatorName, promotionTitle) => {
    try {
        if (!process.env.BREVO_API_KEY) return { success: true, mocked: true };
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { name: "TheCollabify", email: "thecollabify1108@gmail.com" };
        sendSmtpEmail.to = [{ email: sellerEmail, name: sellerName }];
        sendSmtpEmail.subject = `🎉 New Creator Application: ${creatorName}`;
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #8b5cf6;">🎯 New Application!</h2>
                    <p>Hi ${sellerName},</p>
                    <p><strong>${creatorName}</strong> has applied to your promotion: <strong>"${promotionTitle}"</strong></p>
                    <p>Log in to your dashboard to review their profile.</p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/seller/dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Application</a>
                    </div>
                </div>
            </div>
        `;
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true };
    } catch (error) {
        console.error('Brevo applied email error:', error);
        return { success: false };
    }
};

/**
 * Send notification when creator is accepted
 */
const sendCreatorAcceptedEmail = async (creatorEmail, creatorName, promotionTitle, sellerName) => {
    try {
        if (!process.env.BREVO_API_KEY) return { success: true, mocked: true };
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { name: "TheCollabify", email: "thecollabify1108@gmail.com" };
        sendSmtpEmail.to = [{ email: creatorEmail, name: creatorName }];
        sendSmtpEmail.subject = `🎉 Congratulations! You've been accepted!`;
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #10b981;">🎊 You're Accepted!</h2>
                    <p>Hi ${creatorName},</p>
                    <p>Great news! <strong>${sellerName}</strong> has accepted your application for: <strong>"${promotionTitle}"</strong></p>
                    <p>You can now start collaborating!</p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/creator/dashboard" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Start Working</a>
                    </div>
                </div>
            </div>
        `;
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true };
    } catch (error) {
        console.error('Brevo accepted email error:', error);
        return { success: false };
    }
};

/**
 * Send notification about new matching promotion
 */
const sendNewMatchEmail = async (creatorEmail, creatorName, promotionTitle, matchScore, category) => {
    try {
        if (!process.env.BREVO_API_KEY) return { success: true, mocked: true };
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.sender = { name: "TheCollabify", email: "thecollabify1108@gmail.com" };
        sendSmtpEmail.to = [{ email: creatorEmail, name: creatorName }];
        sendSmtpEmail.subject = `🔥 New Opportunity: ${matchScore}% Match!`;
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #0D0D0D; color: #fff;">
                <div style="background: #1a1a1a; padding: 30px; border-radius: 12px; border: 1px solid #333;">
                    <h2 style="color: #8b5cf6;">🚀 New Match!</h2>
                    <p>Hi ${creatorName},</p>
                    <p>A new ${category} promotion matches your profile with a <strong>${matchScore}% score</strong>:</p>
                    <p><strong>"${promotionTitle}"</strong></p>
                    <div style="margin-top: 30px; text-align: center;">
                        <a href="https://thecollabify.tech/creator/dashboard" style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Apply Now</a>
                    </div>
                </div>
            </div>
        `;
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        return { success: true };
    } catch (error) {
        console.error('Brevo match email error:', error);
        return { success: false };
    }
};

module.exports = {
    sendOTPEmail,
    sendCreatorAppliedEmail,
    sendCreatorAcceptedEmail,
    sendNewMatchEmail
};
