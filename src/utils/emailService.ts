import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Check if we have the EMAIL_USER environment variable (for backward compatibility)
    const emailUser = process.env.EMAIL_USER;
    const emailPassword =
      process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD;

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: emailUser || process.env.SMTP_USER,
        pass: emailPassword,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || "JobBuilder"}" <${
          process.env.EMAIL_FROM_ADDRESS || emailUser
        }>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  }

  // Email template for verification
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${
      process.env.FRONTEND_URL || process.env.CLIENT_URL
    }/verify-email/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Hello ${email},</p>
        <p>Thank you for registering with JobBuilder. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The JobBuilder Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  // Email template for password reset
  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${
      process.env.FRONTEND_URL || process.env.CLIENT_URL
    }/reset-password/${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${email},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>Best regards,<br>The JobBuilder Team</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: "Reset Your Password",
      html,
    });
  }
}

export const emailService = new EmailService();
