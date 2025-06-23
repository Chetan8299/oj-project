import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyAccessToken = asyncHandler(async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;
        if (!accessToken) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decoded = jwt.verify(
            accessToken,
            process.env.ACCESS_TOKEN_SECRET
        );
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});
