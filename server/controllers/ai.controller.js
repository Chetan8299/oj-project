import { GoogleGenerativeAI } from "@google/generative-ai";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const aiController = {
    reviewCode: asyncHandler(async (req, res) => {
        const { code, language } = req.body;

        if (!code || !language) {
            throw new ApiError(400, "Code and language are required");
        }

        try {
            // Get the generative model
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            // Construct the prompt
            const prompt = `Please review this ${language} code and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Security concerns
5. Suggestions for improvement
6. Try to keep the response short and concise.

Code to review:
\`\`\`${language}
${code}
\`\`\`

Please format your response in markdown with clear sections.`;

            // Generate the review
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const review = response.text();

            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { review },
                        "Code review generated successfully"
                    )
                );
        } catch (error) {
            throw new ApiError(
                500,
                error.message || "Failed to generate code review"
            );
        }
    }),
};

export default aiController;
