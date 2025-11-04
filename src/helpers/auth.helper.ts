import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const generateOTP = (): string => Math.floor(100000 + Math.random() * 900000).toString();

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (entered: string, hashed: string): Promise<boolean> =>
  bcrypt.compare(entered, hashed);

export const generateTempToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "5m" });

export const generateAccessToken = (id: string): string =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "1h" });

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Admin Auth" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
