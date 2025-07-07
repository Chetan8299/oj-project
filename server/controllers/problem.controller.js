import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Problem } from "../models/problem.model.js";
import { Submission } from "../models/submission.model.js";
import axios from "axios";

const COMPILER_API = process.env.COMPILER_API || "http://localhost:3001";

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

    submitSolution: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { code, language } = req.body;
        const user = req.user;

        if (!code || !language) {
            throw new ApiError(400, "Code and language are required");
        }

        // Get the problem to access test cases
        const problem = await Problem.findById(id);
        if (!problem) {
            throw new ApiError(404, "Problem not found");
        }

        // First run sample test cases
        try {
            const sampleTestResponse = await axios.post(
                `${COMPILER_API}/api/v1/compiler/execute-tests`,
                {
                    code,
                    language,
                    testCases: problem.sampleTestCases,
                }
            );

            const sampleResult = sampleTestResponse.data;

            // If sample tests fail, return early with the results
            if (
                !sampleResult.success ||
                sampleResult.summary.passed !== sampleResult.summary.total
            ) {
                // Save failed submission
                const submission = await Submission.create({
                    problem: id,
                    user: user._id,
                    code,
                    language,
                    status: !sampleResult.success
                        ? "Compilation Error"
                        : "Wrong Answer",
                    testCasesPassed: sampleResult.summary.passed || 0,
                    totalTestCases: problem.sampleTestCases.length,
                    executionTime: Math.max(
                        ...(sampleResult.results?.map(
                            (r) => r.executionTime || 0
                        ) || [0])
                    ),
                    memory: Math.max(
                        ...(sampleResult.results?.map((r) => r.memory || 0) || [
                            0,
                        ])
                    ),
                });

                return res.status(200).json(
                    new ApiResponse(
                        200,
                        {
                            success: false,
                            results: sampleResult.results,
                            summary: sampleResult.summary,
                            passed: false,
                            submissionId: submission._id,
                            isSampleTest: true,
                        },
                        !sampleResult.success
                            ? "Compilation Error"
                            : `Failed sample test cases. Passed ${sampleResult.summary.passed} out of ${sampleResult.summary.total} sample tests`
                    )
                );
            }

            // If sample tests pass, proceed with hidden test cases
            const hiddenTestResponse = await axios.post(
                `${COMPILER_API}/api/v1/compiler/execute-tests`,
                {
                    code,
                    language,
                    testCases: problem.hiddenTestCases,
                }
            );

            const result = hiddenTestResponse.data;

            if (!result.success) {
                // Save failed submission
                const submission = await Submission.create({
                    problem: id,
                    user: user._id,
                    code,
                    language,
                    status: "Compilation Error",
                    testCasesPassed: 0,
                    totalTestCases: problem.hiddenTestCases.length,
                    executionTime: 0,
                    memory: 0,
                });

                throw new ApiError(
                    400,
                    "Code execution failed on hidden test cases"
                );
            }

            const allTestsPassed =
                result.summary.passed === result.summary.total;

            // Calculate execution stats (use max from both sample and hidden tests)
            const maxExecutionTime = Math.max(
                ...result.results.map((r) => r.executionTime || 0),
                ...sampleResult.results.map((r) => r.executionTime || 0)
            );
            const maxMemory = Math.max(
                ...result.results.map((r) => r.memory || 0),
                ...sampleResult.results.map((r) => r.memory || 0)
            );

            // Save submission
            const submission = await Submission.create({
                problem: id,
                user: user._id,
                code,
                language,
                status: allTestsPassed ? "Accepted" : "Wrong Answer",
                testCasesPassed: result.summary.passed,
                totalTestCases: result.summary.total,
                executionTime: maxExecutionTime,
                memory: maxMemory,
            });

            return res.status(200).json(
                new ApiResponse(
                    200,
                    {
                        success: true,
                        results: result.results,
                        summary: result.summary,
                        passed: allTestsPassed,
                        submissionId: submission._id,
                        isSampleTest: false,
                    },
                    allTestsPassed
                        ? "All test cases passed!"
                        : `Passed ${result.summary.passed} out of ${result.summary.total} hidden test cases`
                )
            );
        } catch (error) {
            // If it's a runtime error, save the submission
            if (error.response?.data?.type === "RuntimeError") {
                await Submission.create({
                    problem: id,
                    user: user._id,
                    code,
                    language,
                    status: "Runtime Error",
                    testCasesPassed: 0,
                    totalTestCases: problem.hiddenTestCases.length,
                    executionTime: 0,
                    memory: 0,
                });
            }

            throw new ApiError(
                error.response?.status || 500,
                error.response?.data?.message ||
                    error.message ||
                    "Failed to execute code"
            );
        }
    }),

    // Add a new route to get user's submissions for a problem
    getProblemSubmissions: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const user = req.user;

        const submissions = await Submission.find({
            problem: id,
            user: user._id,
        }).sort({ createdAt: -1 });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    submissions,
                    "Submissions fetched successfully"
                )
            );
    }),
};

export default problemController;
