/**
 * Email Service
 * 
 * Handles sending emails for password reset and other notifications
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials not configured. Email sending will be mocked.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken, name) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Creator Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${name || 'there'},</p>
            <p>You requested to reset your password for your Creator Marketplace account.</p>
            <p>Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in <strong>30 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Creator Marketplace. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // If transporter is not configured, mock the email
  if (!transporter) {
    console.log('📧 [MOCK] Password reset email would be sent to:', email);
    console.log('📧 [MOCK] Reset URL:', resetUrl);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email (optional)
 */
const sendWelcomeEmail = async (email, name, role) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Creator Marketplace" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Creator Marketplace!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome!</h1>
          </div>
          <div class="content">
            <p>Hello ${name}!</p>
            <p>Welcome to Creator Marketplace - the platform connecting Instagram creators with amazing brands!</p>
            ${role === 'creator'
        ? '<p>As a creator, you can:</p><ul><li>Build your profile and showcase your work</li><li>Get matched with relevant promotion opportunities</li><li>Connect with brands looking for influencers like you</li></ul>'
        : '<p>As a seller, you can:</p><ul><li>Create promotion requests for your brand</li><li>Find the perfect creators for your campaigns</li><li>Track your campaign progress in one place</li></ul>'
      }
            <p style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}" class="button">Get Started</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!transporter) {
    console.log('📧 [MOCK] Welcome email would be sent to:', email);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email failed:', error);
    // Don't throw - welcome email is not critical
    return { success: false, error: error.message };
  }
};

/**
 * Send notification when creator applies to promotion
 */
const sendCreatorAppliedEmail = async (sellerEmail, sellerName, creatorName, promotionTitle) => {
  const transporter = createTransporter();
  const dashboardUrl = `${process.env.FRONTEND_URL}/seller/dashboard`;

  const mailOptions = {
    from: `"TheCollabify" <${process.env.EMAIL_USER}>`,
    to: sellerEmail,
    subject: `🎉 New Creator Application: ${creatorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .highlight { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
          .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Application!</h1>
          </div>
          <div class="content">
            <p>Hello ${sellerName}!</p>
            <div class="highlight">
              <strong>${creatorName}</strong> has applied to your promotion:
              <br><em>"${promotionTitle}"</em>
            </div>
            <p>Review their profile and decide if they're a good fit for your campaign!</p>
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">View Application →</a>
            </p>
            <p style="color: #666; font-size: 14px;">💡 Tip: Respond quickly to secure the best creators!</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TheCollabify. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!transporter) {
    console.log('📧 [MOCK] Creator applied email to:', sellerEmail);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Creator applied email sent to:', sellerEmail);
    return { success: true };
  } catch (error) {
    console.error('Creator applied email failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification when creator is accepted
 */
const sendCreatorAcceptedEmail = async (creatorEmail, creatorName, promotionTitle, sellerName) => {
  const transporter = createTransporter();
  const dashboardUrl = `${process.env.FRONTEND_URL}/creator/dashboard`;

  const mailOptions = {
    from: `"TheCollabify" <${process.env.EMAIL_USER}>`,
    to: creatorEmail,
    subject: `🎉 Congratulations! You've been accepted!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .highlight { background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10b981; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 You're Accepted!</h1>
          </div>
          <div class="content">
            <p>Hey ${creatorName}! 🎉</p>
            <div class="highlight">
              Great news! <strong>${sellerName}</strong> has accepted your application for:
              <br><em>"${promotionTitle}"</em>
            </div>
            <p>You can now start working on this exciting campaign! Message the brand to discuss details.</p>
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Start Campaign →</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!transporter) {
    console.log('📧 [MOCK] Creator accepted email to:', creatorEmail);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 Creator accepted email sent to:', creatorEmail);
    return { success: true };
  } catch (error) {
    console.error('Creator accepted email failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification about new matching promotion
 */
const sendNewMatchEmail = async (creatorEmail, creatorName, promotionTitle, matchScore, category) => {
  const transporter = createTransporter();
  const dashboardUrl = `${process.env.FRONTEND_URL}/creator/dashboard`;

  const mailOptions = {
    from: `"TheCollabify" <${process.env.EMAIL_USER}>`,
    to: creatorEmail,
    subject: `🔥 New Opportunity: ${matchScore}% Match!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .button { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .match-score { font-size: 48px; font-weight: bold; color: #8b5cf6; }
          .highlight { background: #faf5ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 New Opportunity!</h1>
          </div>
          <div class="content">
            <p>Hey ${creatorName}!</p>
            <p style="text-align: center;" class="match-score">${matchScore}% Match</p>
            <div class="highlight">
              A new ${category} promotion matches your profile:
              <br><strong>"${promotionTitle}"</strong>
            </div>
            <p>Apply now before other creators do!</p>
            <p style="text-align: center;">
              <a href="${dashboardUrl}" class="button">View & Apply →</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  if (!transporter) {
    console.log('📧 [MOCK] New match email to:', creatorEmail);
    return { success: true, mocked: true };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log('📧 New match email sent to:', creatorEmail);
    return { success: true };
  } catch (error) {
    console.error('New match email failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendCreatorAppliedEmail,
  sendCreatorAcceptedEmail,
  sendNewMatchEmail
};
