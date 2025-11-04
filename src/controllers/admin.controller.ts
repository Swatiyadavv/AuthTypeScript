import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";
import {
  generateOTP,
  hashPassword,
  comparePassword,
  generateTempToken,
  generateAccessToken,
  sendEmail,
} from "../helpers/auth.helper";
import { successResponse, errorResponse } from "../formatter/responseFormatter";

export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Check admin by email only
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json(errorResponse("Admin already exists. Please login."));

    const hashed = await hashPassword(password);
    const otp = generateOTP();

    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      otp,
      otpExpire: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(email, "Admin Registration OTP", `<p>Your OTP: <b>${otp}</b></p><p>Valid for 5 minutes</p>`);

    const tempToken = generateTempToken(admin._id.toString());
    return res.status(201).json(successResponse("OTP sent to email", { tempToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("Registration failed", err));
  }
};


// 🟢 VERIFY REGISTER (uses tempToken)
export const verifyAdminOTP = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json(errorResponse("Token required"));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    if (!admin.otp || !admin.otpExpire) return res.status(400).json(errorResponse("No OTP found"));
    if (admin.otpExpire < new Date()) return res.status(400).json(errorResponse("OTP expired"));
    if (admin.otp !== otp) return res.status(400).json(errorResponse("Invalid OTP"));

    admin.verified = true;
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    const accessToken = generateAccessToken(admin._id.toString());
    return res.status(200).json(successResponse("Account verified successfully", { accessToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("OTP verification failed", err));
  }
};

// 🟢 LOGIN
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) return res.status(400).json(errorResponse("Invalid credentials"));

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendEmail(email, "Login OTP", `<p>Your OTP: <b>${otp}</b></p><p>Valid for 5 minutes</p>`);

    const tempToken = generateTempToken(admin._id.toString());
    return res.status(200).json(successResponse("Login OTP sent to email", { tempToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("Login failed", err));
  }
};

// 🟢 VERIFY LOGIN
export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json(errorResponse("Token required"));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    if (!admin.otp || !admin.otpExpire) return res.status(400).json(errorResponse("No OTP found"));
    if (admin.otpExpire < new Date()) return res.status(400).json(errorResponse("OTP expired"));
    if (admin.otp !== otp) return res.status(400).json(errorResponse("Invalid OTP"));

    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    const accessToken = generateAccessToken(admin._id.toString());
    return res.status(200).json(successResponse("Login successful", { accessToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("OTP verification failed", err));
  }
};

// 🟢 FORGOT PASSWORD
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendEmail(email, "Password Reset OTP", `<p>Your OTP: <b>${otp}</b></p><p>Valid for 5 minutes</p>`);

    const tempToken = generateTempToken(admin._id.toString());
    return res.status(200).json(successResponse("OTP sent for password reset", { tempToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to send reset OTP", err));
  }
};

// 🟢 RESET PASSWORD (using tempToken)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json(errorResponse("Token required"));

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    // ✅ Directly reset password without OTP check
    admin.password = await hashPassword(newPassword);
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    return res.status(200).json(successResponse("Password reset successful"));
  } catch (err) {
    return res.status(500).json(errorResponse("Password reset failed", err));
  }
};
