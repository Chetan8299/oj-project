import { Router } from "express";
import aiController from "../controllers/ai.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Protect the route with authentication
router.post("/review-code", verifyAccessToken, aiController.reviewCode);

export default router;
