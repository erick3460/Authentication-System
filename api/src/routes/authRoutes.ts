import { Router } from "express";
import { authController } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

// Rotas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);

// Rotas protegidas
router.post("/logout", authMiddleware, authController.logout);
router.get("/profile", authMiddleware, authController.profile);

export { router as authRoutes };
