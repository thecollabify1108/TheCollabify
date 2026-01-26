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

module.exports = {
    sendOTPEmail
};
