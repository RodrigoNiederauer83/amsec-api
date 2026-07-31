import { Router } from "express";
import { register, login, me, resetPassword, forgotPassword, deleteAccount, updateName, confirmEmailChange, requestEmailChange, updatePhone, googleLogin } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { confirmEmailChangeSchema, deleteAccountSchema, forgotPasswordSchema, googleLoginSchema, loginSchema, registerSchema, requestEmailChangeSchema, resetPasswordSchema, updateNameSchema, updatePhoneSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",validate(loginSchema) , login);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.delete("/me", authMiddleware, validate(deleteAccountSchema, "body"), deleteAccount);
router.patch("/me", authMiddleware, validate(updateNameSchema, "body"), updateName);
router.post("/change-email", authMiddleware, validate(requestEmailChangeSchema, "body"), requestEmailChange);
router.post("/confirm-email-change", validate(confirmEmailChangeSchema, "body"), confirmEmailChange);
router.patch("/phone", authMiddleware, validate(updatePhoneSchema, "body"), updatePhone);
router.post("/google", validate(googleLoginSchema, "body"), googleLogin);

export default router;