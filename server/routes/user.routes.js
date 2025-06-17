import { Router } from "express";
import userController from "../controllers/user.controller.js";

const router = Router();

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/logout").post(userController.logout);

export default router;
