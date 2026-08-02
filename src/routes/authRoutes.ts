import { Router } from "express";
import { register, login, me, resetPassword, forgotPassword, deleteAccount, updateName, confirmEmailChange, requestEmailChange, updatePhone, googleLogin } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { confirmEmailChangeSchema, deleteAccountSchema, forgotPasswordSchema, googleLoginSchema, loginSchema, registerSchema, requestEmailChangeSchema, resetPasswordSchema, updateNameSchema, updatePhoneSchema } from "../schemas/authSchemas";
import { loginRateLimiter, sensitiveActionRateLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", loginRateLimiter, validate(loginSchema), login);
router.post("/google", loginRateLimiter, validate(googleLoginSchema, "body"), googleLogin);
router.post("/forgot-password", sensitiveActionRateLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", sensitiveActionRateLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/change-email", authMiddleware, validate(requestEmailChangeSchema, "body"), requestEmailChange);
router.post("/confirm-email-change", validate(confirmEmailChangeSchema, "body"), confirmEmailChange);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, validate(updateNameSchema, "body"), updateName);
router.patch("/phone", authMiddleware, validate(updatePhoneSchema, "body"), updatePhone);
router.delete("/me", authMiddleware, validate(deleteAccountSchema, "body"), deleteAccount);

export default router;