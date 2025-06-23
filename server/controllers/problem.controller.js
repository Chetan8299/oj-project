import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Problem } from "../models/problem.model.js";

const problemController = {
    createProblem: asyncHandler(async (req, res) => {
        const {
            title,
            description,
            sampleTestCases,
            constraints,
            difficulty,
            tags,
            hiddenTestCases,
        } = req.body;

        if (
            !title ||
            !description ||
            !sampleTestCases ||
            !constraints ||
            !difficulty ||
            !tags
        ) {
            throw new ApiError(400, "All required fields must be provided");
        }

        const user = req.user;

        // For now, allow any authenticated user to create problems
        // Later you can add role-based authorization

        const problem = await Problem.create({
            title,
            description,
            sampleTestCases,
            constraints,
            difficulty,
            tags,
            hiddenTestCases,
            setter: user._id,
        });

        if (!problem) {
            throw new ApiError(500, "Failed to create problem");
        }

        return res
            .status(201)
            .json(
                new ApiResponse(201, problem, "Problem created successfully")
            );
    }),

    getProblems: asyncHandler(async (req, res) => {
        const problems = await Problem.find();
        return res
            .status(200)
            .json(
                new ApiResponse(200, problems, "Problems fetched successfully")
            );
    }),

    getProblemById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const problem = await Problem.findById(id);
        return res
            .status(200)
            .json(
                new ApiResponse(200, problem, "Problem fetched successfully")
            );
    }),

    updateProblem: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const {
            title,
            description,
            sampleTestCases,
            constraints,
            difficulty,
            tags,
            hiddenTestCases,
        } = req.body;
        const user = req.user;

        const problem = await Problem.findById(id);

        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        if (user.role !== "setter" && user.role !== "admin") {
            throw new ApiError(
                403,
                "You are not authorized to update this problem"
            );
        }

        if (problem.setter.toString() !== user._id.toString()) {
            throw new ApiError(
                403,
                "You are not authorized to update this problem"
            );
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            id,
            {
                title,
                description,
                sampleTestCases,
                constraints,
                difficulty,
                tags,
                hiddenTestCases,
            },
            { new: true }
        );

        if (!updatedProblem) {
            throw new ApiError(500, "Failed to update problem");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedProblem,
                    "Problem updated successfully"
                )
            );
    }),
};

export default problemController;
