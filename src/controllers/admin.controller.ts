import { Request, Response } from "express";
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

/**
 * Only one admin allowed. If admin exists -> reject registration.
 */

// Register (create admin + send OTP + return tempToken)
export const registerAdmin = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const anyAdmin = await Admin.findOne();
    if (anyAdmin) {
      return res.status(400).json(errorResponse("Admin already exists. Please login."));
    }

    // optional: avoid duplicate email (defensive)
    const emailUsed = await Admin.findOne({ email });
    if (emailUsed) {
      return res.status(400).json(errorResponse("Admin with this email already exists. Please login."));
    }

    const hashed = await hashPassword(password);
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const admin = await Admin.create({
      name,
      email,
      password: hashed,
      otp,
      otpExpire,
    });

    // send OTP
    await sendEmail(email, "Verify Admin Account - OTP", `<p>Your OTP: <b>${otp}</b></p><p>Valid for 5 minutes</p>`);

    const tempToken = generateTempToken(admin._id.toString()); // valid 5m
    return res.status(201).json(successResponse("Admin registered. OTP sent to email.", { tempToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("Registration failed", err));
  }
};


// Verify OTP after register (confirm account -> returns access token)
export const verifyAdminOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found"));

    if (!admin.otp || !admin.otpExpire) {
      return res.status(400).json(errorResponse("No OTP found. Please register/login again."));
    }

    if (admin.otpExpire < new Date()) {
      return res.status(400).json(errorResponse("OTP expired. Please request again."));
    }

    if (admin.otp !== otp) {
      return res.status(400).json(errorResponse("Invalid OTP"));
    }

    admin.verified = true;
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    const accessToken = generateAccessToken(admin._id.toString()); // 1 hour
    return res.status(200).json(successResponse("OTP verified. Admin activated.", { accessToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("OTP verification failed", err));
  }
};

// Login -> send OTP (temp token returned)
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found."));

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) return res.status(400).json(errorResponse("Invalid credentials."));

    // generate OTP and save
    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendEmail(email, "Login OTP", `<p>Your Login OTP: <b>${otp}</b></p><p>Valid 5 minutes</p>`);

    const tempToken = generateTempToken(admin._id.toString());
    return res.status(200).json(successResponse("OTP sent to email for login.", { tempToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("Login failed", err));
  }
};

// Verify Login OTP -> returns access token
export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found."));

    if (!admin.otp || !admin.otpExpire) {
      return res.status(400).json(errorResponse("No OTP found. Please login again."));

    }

    if (admin.otpExpire < new Date()) {
      return res.status(400).json(errorResponse("OTP expired. Please login again."));
    }

    if (admin.otp !== otp) {
      return res.status(400).json(errorResponse("Invalid OTP"));
    }

    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    const accessToken = generateAccessToken(admin._id.toString());
    return res.status(200).json(successResponse("Login successful.", { accessToken }));
  } catch (err) {
    return res.status(500).json(errorResponse("OTP verification failed", err));
  }
};

// Forgot password -> send OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found."));

    const otp = generateOTP();
    admin.otp = otp;
    admin.otpExpire = new Date(Date.now() + 5 * 60 * 1000);
    await admin.save();

    await sendEmail(email, "Password Reset OTP", `<p>Your password reset OTP: <b>${otp}</b></p><p>Valid 5 minutes</p>`);
    return res.status(200).json(successResponse("OTP sent to email for password reset."));
  } catch (err) {
    return res.status(500).json(errorResponse("Failed to send reset OTP", err));
  }
};

// Reset password (using email + otp + newPassword)
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json(errorResponse("email, otp and newPassword are required"));
    }

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json(errorResponse("Admin not found."));

    if (!admin.otp || !admin.otpExpire) {
      return res.status(400).json(errorResponse("No OTP found. Please request forgot password again."));
    }

    if (admin.otpExpire < new Date()) {
      return res.status(400).json(errorResponse("OTP expired. Please request again."));
    }

    if (admin.otp !== otp) {
      return res.status(400).json(errorResponse("Invalid OTP"));
    }

    admin.password = await hashPassword(newPassword);
    admin.otp = null;
    admin.otpExpire = null;
    await admin.save();

    return res.status(200).json(successResponse("Password reset successful. Please login."));
  } catch (err) {
    return res.status(500).json(errorResponse("Reset failed", err));
  }
};
