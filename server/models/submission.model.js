import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        problem: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Runtime Error",
                "Compilation Error",
            ],
            required: true,
        },
        testCasesPassed: {
            type: Number,
            required: true,
        },
        totalTestCases: {
            type: Number,
            required: true,
        },
        executionTime: {
            type: Number, // in milliseconds
            default: 0,
        },
        memory: {
            type: Number, // in KB
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for faster queries
submissionSchema.index({ problem: 1, user: 1, createdAt: -1 });

export const Submission = mongoose.model("Submission", submissionSchema);
