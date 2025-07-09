import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const EditProblem = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { loading, error, execute } = useApiCall();
    const [successMessage, setSuccessMessage] = useState("");
    const [loadingProblem, setLoadingProblem] = useState(true);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        constraints: "",
        difficulty: "Easy",
        tags: "",
        sampleInputs: "",
        sampleOutputs: "",
        hiddenInputs: "",
        hiddenOutputs: "",
    });

    // Helper function to convert test case arrays back to strings
    const testCasesToString = (testCases) => {
        if (!testCases || testCases.length === 0) return "";
        return testCases.map((tc) => tc.input || tc.output).join("\n---\n");
    };

    // Fetch existing problem data
    useEffect(() => {
        const fetchProblem = async () => {
            setLoadingProblem(true);
            try {
                const response = await problemService.getProblemById(id);
                if (response.success) {
                    const problem = response.data;
                    setFormData({
                        title: problem.title || "",
                        description: problem.description || "",
                        constraints: problem.constraints || "",
                        difficulty: problem.difficulty || "Easy",
                        tags: problem.tags ? problem.tags.join(", ") : "",
                        sampleInputs: testCasesToString(
                            problem.sampleTestCases?.map((tc) => ({
                                input: tc.input,
                            })) || []
                        ),
                        sampleOutputs: testCasesToString(
                            problem.sampleTestCases?.map((tc) => ({
                                output: tc.output,
                            })) || []
                        ),
                        hiddenInputs: testCasesToString(
                            problem.hiddenTestCases?.map((tc) => ({
                                input: tc.input,
                            })) || []
                        ),
                        hiddenOutputs: testCasesToString(
                            problem.hiddenTestCases?.map((tc) => ({
                                output: tc.output,
                            })) || []
                        ),
                    });
                } else {
                    navigate("/problems");
                }
            } catch (error) {
                console.error("Failed to fetch problem:", error);
                navigate("/problems");
            } finally {
                setLoadingProblem(false);
            }
        };

        if (id) {
            fetchProblem();
        }
    }, [id, navigate]);

    // Helper function to parse string inputs/outputs into test case arrays
    const parseTestCases = (inputs, outputs) => {
        const inputLines = inputs
            .split("---")
            .map((input) => input.trim())
            .filter((input) => input);
        const outputLines = outputs
            .split("---")
            .map((output) => output.trim())
            .filter((output) => output);

        const testCases = [];
        const minLength = Math.min(inputLines.length, outputLines.length);

        for (let i = 0; i < minLength; i++) {
            testCases.push({
                input: inputLines[i],
                output: outputLines[i],
            });
        }

        return testCases;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problemData = {
            ...formData,
            tags: formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag),
            sampleTestCases: parseTestCases(
                formData.sampleInputs,
                formData.sampleOutputs
            ),
            hiddenTestCases: parseTestCases(
                formData.hiddenInputs,
                formData.hiddenOutputs
            ),
        };

        // Remove the string fields from the data being sent
        delete problemData.sampleInputs;
        delete problemData.sampleOutputs;
        delete problemData.hiddenInputs;
        delete problemData.hiddenOutputs;

        await execute(
            () => problemService.updateProblem(id, problemData),
            (response) => {
                if (response.success) {
                    setSuccessMessage("Problem updated successfully!");
                    setTimeout(() => {
                        navigate(`/problems/${id}`);
                    }, 2000);
                }
            }
        );
    };

    if (loadingProblem) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Edit Problem
                    </h1>
                    <p className="text-slate-600">
                        Update the coding problem details
                    </p>
                </div>

                {/* Success/Error Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Basic Information
                            </h2>

                            <div>
                                <label
                                    htmlFor="title"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Problem Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter problem title"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Problem Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={6}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Describe the problem in detail..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="difficulty"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Difficulty *
                                    </label>
                                    <select
                                        id="difficulty"
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        required
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="tags"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Tags *
                                    </label>
                                    <input
                                        type="text"
                                        id="tags"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="array, sorting, dynamic-programming"
                                        required
                                    />
                                    <p className="mt-1 text-sm text-slate-500">
                                        Separate tags with commas
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="constraints"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Constraints *
                                </label>
                                <textarea
                                    id="constraints"
                                    name="constraints"
                                    value={formData.constraints}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="1 ≤ n ≤ 10^5&#10;1 ≤ arr[i] ≤ 10^9"
                                    required
                                />
                            </div>
                        </div>

                        {/* Sample Test Cases */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    Sample Test Cases
                                </h2>
                                <p className="text-sm text-slate-600 mb-4">
                                    Separate multiple test cases with "---"
                                    (three dashes) on a new line
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="sampleInputs"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Sample Inputs *
                                        </label>
                                        <textarea
                                            id="sampleInputs"
                                            name="sampleInputs"
                                            value={formData.sampleInputs}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                                            placeholder="5 3&#10;---&#10;10 2&#10;---&#10;7 4"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="sampleOutputs"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Sample Outputs *
                                        </label>
                                        <textarea
                                            id="sampleOutputs"
                                            name="sampleOutputs"
                                            value={formData.sampleOutputs}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                                            placeholder="8&#10;---&#10;12&#10;---&#10;11"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Hidden Test Cases */}
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    Hidden Test Cases
                                </h2>
                                <p className="text-sm text-slate-600 mb-4">
                                    Separate multiple test cases with "---"
                                    (three dashes) on a new line
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label
                                            htmlFor="hiddenInputs"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Hidden Inputs
                                        </label>
                                        <textarea
                                            id="hiddenInputs"
                                            name="hiddenInputs"
                                            value={formData.hiddenInputs}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                                            placeholder="1000 500&#10;---&#10;999 1&#10;---&#10;50 25"
                                        />
                                    </div>
                                    <div>
                                        <label
                                            htmlFor="hiddenOutputs"
                                            className="block text-sm font-medium text-slate-700 mb-2"
                                        >
                                            Hidden Outputs
                                        </label>
                                        <textarea
                                            id="hiddenOutputs"
                                            name="hiddenOutputs"
                                            value={formData.hiddenOutputs}
                                            onChange={handleChange}
                                            rows={8}
                                            className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                                            placeholder="1500&#10;---&#10;1000&#10;---&#10;75"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => navigate(`/problems/${id}`)}
                                className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Updating..." : "Update Problem"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default EditProblem;
