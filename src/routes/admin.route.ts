import { Router } from "express";
import {
  registerAdmin,
  verifyAdminOTP,
  loginAdmin,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
} from "../controllers/admin.controller";
import { verifyTempToken } from "../middlewares/verifyTempToken";

const router = Router();

// Public routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/forgot", forgotPassword);

// Routes that need tempToken verification
router.post("/verify-register", verifyTempToken, verifyAdminOTP);
router.post("/verify-login", verifyTempToken, verifyLoginOTP);
router.post("/reset", verifyTempToken, resetPassword);

export default router;
