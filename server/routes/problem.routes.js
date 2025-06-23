import { Router } from "express";
import problemController from "../controllers/problem.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyAccessToken, problemController.createProblem);
router.route("/").get(problemController.getProblems);
router.route("/:id").get(problemController.getProblemById);
router.route("/:id").put(verifyAccessToken, problemController.updateProblem);

export default router;