import { Router } from "express";
import problemController from "../controllers/problem.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", problemController.getProblems);
router.get("/:id", problemController.getProblemById);

// Protected routes
router.post("/", verifyAccessToken, problemController.createProblem);
router.put("/:id", verifyAccessToken, problemController.updateProblem);
router.post("/:id/submit", verifyAccessToken, problemController.submitSolution);
router.get(
    "/:id/submissions",
    verifyAccessToken,
    problemController.getProblemSubmissions
);

export default router;
