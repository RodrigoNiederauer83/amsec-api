import { Router } from "express";
import { register, login, me, resetPassword, forgotPassword } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",validate(loginSchema) , login);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;