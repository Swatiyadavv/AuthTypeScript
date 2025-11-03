import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (entered: string, hashed: string): Promise<boolean> => {
  return bcrypt.compare(entered, hashed);
};

// short-lived temp token (5 minutes) - used immediately after register/login to carry identity for OTP verify
export const generateTempToken = (payload: string | object): string => {
  return jwt.sign(typeof payload === "string" ? { id: payload } : payload, process.env.JWT_SECRET!, { expiresIn: "5m" });
};

// access token (1 hour)
export const generateAccessToken = (payload: string | object): string => {
  return jwt.sign(typeof payload === "string" ? { id: payload } : payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
};

// send email (uses Gmail SMTP - configure app password)
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Admin Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
