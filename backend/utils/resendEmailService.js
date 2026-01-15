const { Resend } = require('resend');

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP verification email using Resend
 */
const sendOTPEmail = async (email, name, otpCode) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'TheCollabify <onboarding@resend.dev>', // You can use verified domain later
            to: [email],
            subject: 'Verify Your Email - TheCollabify',
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #fff; background: #0D0D0D; margin: 0; padding: 0; }
                  .container { max-width: 600px; margin: 40px auto; padding: 0; }
                  .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
                  .logo { font-size: 24px; font-weight: bold; color: white; margin-bottom: 10px; }
                  .content { background: #1a1a1a; padding: 40px 30px; border-radius: 0 0 12px 12px; }
                  .otp-box { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; }
                  .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 12px; color: white; margin: 0; font-family: 'Courier New', monospace; }
                  .text { color: #d1d5db; margin: 15px 0; }
                  .highlight { color: #8b5cf6; font-weight: bold; }
                  .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <div class="logo">✨ TheCollabify</div>
                    <h1 style="margin: 0; color: white; font-size: 28px;">Verify Your Email</h1>
                  </div>
                  <div class="content">
                    <p class="text">Hi <strong>${name}</strong>,</p>
                    <p class="text">Welcome to TheCollabify! 🎉</p>
                    <p class="text">Please enter this verification code to complete your action:</p>
                    
                    <div class="otp-box">
                      <p class="otp-code">${otpCode}</p>
                    </div>
                    
                    <p class="text">This code is valid for <span class="highlight">10 minutes</span>.</p>
                    
                    <p style="color: #9ca3af; font-size: 14px; margin-top: 30px;">
                      🔒 Security Tip: Never share this code with anyone. TheCollabify will never ask for your OTP.
                    </p>
                    
                    <p style="color: #fbbf24; font-size: 14px; margin-top: 20px;">
                      If you didn't request this code, please ignore this email.
                    </p>
                  </div>
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} TheCollabify - AI-Powered Influencer Marketing Platform</p>
                  </div>
                </div>
              </body>
              </html>
            `
        });

        if (error) {
            console.error('Resend email error:', error);
            throw new Error('Failed to send OTP email');
        }

        console.log('📧 OTP email sent via Resend to:', email);
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send OTP email');
    }
};

module.exports = {
    sendOTPEmail
};
