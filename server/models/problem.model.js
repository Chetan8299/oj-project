import mongoose from "mongoose";

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    sampleTestCases: {
        type: [
            {
                input: {
                    type: String,
                    required: true,
                },
                output: {
                    type: String,
                    required: true,
                },
            },
        ],
        required: true,
    },
    constraints: {
        type: String,
        required: true,
    },
    // Structured constraints for enforcement
    structuredConstraints: {
        timeLimit: {
            type: Number, // in milliseconds
            default: 2000, // 2 seconds default
        },
        memoryLimit: {
            type: Number, // in MB
            default: 256, // 256MB default
        },
        inputConstraints: [{
            variable: String, // e.g., "n", "arr[i]"
            min: Number,
            max: Number,
            type: {
                type: String,
                enum: ["integer", "array_size", "string_length"],
                default: "integer"
            }
        }]
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true,
    },
    tags: {
        type: Array,
        required: true,
    },
    hiddenTestCases: {
        type: [
            {
                input: {
                    type: String,
                    required: true,
                },
                output: {
                    type: String,
                    required: true,
                },
            },
        ],
    },
    setter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

export const Problem = mongoose.model("Problem", problemSchema);
