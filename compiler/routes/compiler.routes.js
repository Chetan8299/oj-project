import compilerController from "../controllers/compiler.controller.js";
import { Router } from "express";

const router = Router();

// Execute code
router.post("/execute", compilerController.executeCode);

// Execute test cases
router.post("/execute-tests", compilerController.executeTestCases);

// Check supported languages
router.get("/languages", compilerController.getSupportedLanguages);

export default router;
