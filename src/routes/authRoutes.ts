import { Router } from "express";
import { register, login, me, resetPassword, forgotPassword, deleteAccount, updateName } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { deleteAccountSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, updateNameSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",validate(loginSchema) , login);
router.get("/me", authMiddleware, me);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.delete("/me", authMiddleware, validate(deleteAccountSchema, "body"), deleteAccount);
router.patch("/me", authMiddleware, validate(updateNameSchema, "body"), updateName);

export default router;