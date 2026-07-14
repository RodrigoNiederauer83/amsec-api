import { Router } from "express";
import { register, login, me } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validationMiddleware";
import { loginSchema, registerSchema } from "../schemas/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login",validate(loginSchema) , login);
router.get("/me", authMiddleware, me);

export default router;