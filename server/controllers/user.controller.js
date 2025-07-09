import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { COOKIE_OPTIONS } from "../utils/constants.js";

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

    getUser: asyncHandler(async (req, res) => {
        const user = await User.findById(req.user._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Get submission statistics
        const submissionStats = await Submission.aggregate([
            { $match: { user: user._id } },
            {
                $group: {
                    _id: null,
                    totalSubmissions: { $sum: 1 },
                    acceptedSubmissions: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0],
                        },
                    },
                    // Count unique problems solved
                    uniqueProblemsSolved: {
                        $addToSet: {
                            $cond: [
                                { $eq: ["$status", "Accepted"] },
                                "$problem",
                                null,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    totalSubmissions: 1,
                    acceptedSubmissions: 1,
                    problemsSolved: {
                        $size: {
                            $filter: {
                                input: "$uniqueProblemsSolved",
                                as: "problem",
                                cond: { $ne: ["$$problem", null] },
                            },
                        },
                    },
                },
            },
        ]);

        const stats = submissionStats[0] || {
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            problemsSolved: 0,
        };

        const userResponse = {
            ...user.toObject(),
            stats,
        };

        return res
            .status(200)
            .json(
                new ApiResponse(200, userResponse, "User fetched Successfully")
            );
    }),

    updateUser: asyncHandler(async (req, res) => {
        const { name, username, email, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        user.name = name || user.name;
        user.username = username || user.username;
        user.email = email || user.email;
        user.avatar = avatar || user.avatar;

        await user.save();

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User updated Successfully"));
    }),

    // Admin endpoints
    getAllUsers: asyncHandler(async (req, res) => {
        const user = req.user;

        // Check if user is admin
        if (user.role !== "admin") {
            throw new ApiError(
                403,
                "Access denied. Admin privileges required."
            );
        }

        const {
            page = 1,
            limit = 10,
            role,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        // Build query object
        const query = {};

        // Filter by role
        if (role && role !== "all") {
            query.role = role;
        }

        // Search in username and email
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        // Fetch users with pagination
        const [users, totalUsers] = await Promise.all([
            User.find(query, "-password")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query),
        ]);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalUsers / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;

        const paginationData = {
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalUsers,
                limit: parseInt(limit),
                hasNextPage,
                hasPrevPage,
            },
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    paginationData,
                    "Users fetched successfully"
                )
            );
    }),

    updateUserRole: asyncHandler(async (req, res) => {
        const user = req.user;
        const { userId } = req.params;
        const { role } = req.body;

        // Check if user is admin
        if (user.role !== "admin") {
            throw new ApiError(
                403,
                "Access denied. Admin privileges required."
            );
        }

        // Validate role
        if (!["admin", "user", "setter"].includes(role)) {
            throw new ApiError(
                400,
                "Invalid role. Must be admin, user, or setter."
            );
        }

        // Don't allow changing own role
        if (userId === user._id.toString()) {
            throw new ApiError(400, "Cannot change your own role.");
        }

        const targetUser = await User.findById(userId);
        if (!targetUser) {
            throw new ApiError(404, "User not found");
        }

        targetUser.role = role;
        await targetUser.save();

        // Return user without password
        const updatedUser = await User.findById(userId, "-password");

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedUser,
                    `User role updated to ${role} successfully`
                )
            );
    }),
};

export default userController;
