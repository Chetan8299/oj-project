import { User } from "../models/user.model";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import { COOKIE_OPTIONS } from "../utils/constants";

const generateAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh token");
    }
};

const userController = {
    register: asyncHandler(async (req, res) => {
        const { name, username, email, password, avatar } = req.body;

        if (!name || !username || !email || !password) {
            throw new ApiError(400, "All fields are required");
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            throw new ApiError(400, "User already exists");
        }

        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            avatar,
        });

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        if (!createdUser) {
            throw new ApiError(500, "Failed to create user");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, createdUser, "User created Successfully")
            );
    }),

    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new ApiError(400, "All fields are required");
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            throw new ApiError(400, "Invalid email or password");
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid password");
        }

        const { accessToken, refreshToken } =
            await generateAccessAndRefreshToken(user);

        return res
            .status(200)
            .cookie("refreshToken", refreshToken, COOKIE_OPTIONS)
            .cookie("accessToken", accessToken, COOKIE_OPTIONS)
            .json(new ApiResponse(200, user, "Login Successfully"));
    }),

    logout: asyncHandler(async (req, res) => {
        return res
            .status(200)
            .clearCookie("refreshToken", COOKIE_OPTIONS)
            .clearCookie("accessToken", COOKIE_OPTIONS)
            .json(new ApiResponse(200, null, "Logout Successfully"));
    }),
};

export default userController;
