import { Router } from "express";
import userController from "../controllers/user.controller.js";
import { verifyAccessToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/logout").post(userController.logout);

// Protected routes
router.route("/user").get(verifyAccessToken, userController.getUser);
router.route("/user").put(verifyAccessToken, userController.updateUser);

export default router;
