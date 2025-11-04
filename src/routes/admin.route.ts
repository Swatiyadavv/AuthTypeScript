import { Router } from "express";
import {
  registerAdmin,
  verifyAdminOTP,
  loginAdmin,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/admin.controller";

const router = Router();

// public
router.post("/register", registerAdmin);         // register -> sends OTP
router.post("/verify-register", verifyAdminOTP); // verify register OTP -> returns access token

router.post("/login", loginAdmin);               // login -> sends OTP
router.post("/verify-login", verifyLoginOTP);    // verify login OTP -> returns access token

router.post("/forgot", forgotPassword);          // forgot password -> sends OTP
router.post("/reset", resetPassword);            // reset password using OTP

export default router;
