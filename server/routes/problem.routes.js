import { Router } from "express";
import problemController from "../controllers/problem.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.get("/", problemController.getProblems);

// Protected routes - specific routes must come before parameterized routes
router.post("/", verifyAccessToken, problemController.createProblem);
router.get("/my-problems", verifyAccessToken, problemController.getMyProblems);
router.get("/:id", problemController.getProblemById);
router.put("/:id", verifyAccessToken, problemController.updateProblem);
router.delete("/:id", verifyAccessToken, problemController.deleteProblem);
router.post("/:id/submit", verifyAccessToken, problemController.submitSolution);
router.get(
    "/:id/submissions",
    verifyAccessToken,
    problemController.getProblemSubmissions
);

export default router;
