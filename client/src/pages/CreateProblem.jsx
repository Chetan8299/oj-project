import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const CreateProblem = () => {
    const navigate = useNavigate();
    const { loading, error, execute } = useApiCall();
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        constraints: "",
        difficulty: "Easy",
        tags: "",
        sampleTestCases: [{ input: "", output: "" }],
        hiddenTestCases: [{ input: "", output: "" }],
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setSuccessMessage("");
    };

    const handleTestCaseChange = (index, field, value, type) => {
        const testCases = [...formData[type]];
        testCases[index][field] = value;
        setFormData({ ...formData, [type]: testCases });
    };

    const addTestCase = (type) => {
        setFormData({
            ...formData,
            [type]: [...formData[type], { input: "", output: "" }],
        });
    };

    const removeTestCase = (index, type) => {
        if (formData[type].length > 1) {
            const testCases = formData[type].filter((_, i) => i !== index);
            setFormData({ ...formData, [type]: testCases });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const problemData = {
            ...formData,
            tags: formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag),
        };

        await execute(
            () => problemService.createProblem(problemData),
            (response) => {
                if (response.success) {
                    setSuccessMessage("Problem created successfully!");
                    setTimeout(() => {
                        navigate("/");
                    }, 2000);
                }
            }
        );
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Create Problem
                    </h1>
                    <p className="text-slate-600">
                        Add a new coding problem to the platform
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
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Sample Test Cases
                                </h2>
                                <button
                                    type="button"
                                    onClick={() =>
                                        addTestCase("sampleTestCases")
                                    }
                                    className="px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    + Add Test Case
                                </button>
                            </div>

                            {formData.sampleTestCases.map((testCase, index) => (
                                <div
                                    key={index}
                                    className="border border-slate-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-slate-700">
                                            Test Case {index + 1}
                                        </h3>
                                        {formData.sampleTestCases.length >
                                            1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTestCase(
                                                        index,
                                                        "sampleTestCases"
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Input
                                            </label>
                                            <textarea
                                                value={testCase.input}
                                                onChange={(e) =>
                                                    handleTestCaseChange(
                                                        index,
                                                        "input",
                                                        e.target.value,
                                                        "sampleTestCases"
                                                    )
                                                }
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Input for this test case"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Expected Output
                                            </label>
                                            <textarea
                                                value={testCase.output}
                                                onChange={(e) =>
                                                    handleTestCaseChange(
                                                        index,
                                                        "output",
                                                        e.target.value,
                                                        "sampleTestCases"
                                                    )
                                                }
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Expected output for this test case"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Hidden Test Cases */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-slate-900">
                                    Hidden Test Cases
                                </h2>
                                <button
                                    type="button"
                                    onClick={() =>
                                        addTestCase("hiddenTestCases")
                                    }
                                    className="px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    + Add Test Case
                                </button>
                            </div>

                            {formData.hiddenTestCases.map((testCase, index) => (
                                <div
                                    key={index}
                                    className="border border-slate-200 rounded-lg p-4"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-sm font-medium text-slate-700">
                                            Hidden Test Case {index + 1}
                                        </h3>
                                        {formData.hiddenTestCases.length >
                                            1 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeTestCase(
                                                        index,
                                                        "hiddenTestCases"
                                                    )
                                                }
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Input
                                            </label>
                                            <textarea
                                                value={testCase.input}
                                                onChange={(e) =>
                                                    handleTestCaseChange(
                                                        index,
                                                        "input",
                                                        e.target.value,
                                                        "hiddenTestCases"
                                                    )
                                                }
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Input for this test case"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Expected Output
                                            </label>
                                            <textarea
                                                value={testCase.output}
                                                onChange={(e) =>
                                                    handleTestCaseChange(
                                                        index,
                                                        "output",
                                                        e.target.value,
                                                        "hiddenTestCases"
                                                    )
                                                }
                                                rows={3}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                placeholder="Expected output for this test case"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => navigate("/")}
                                className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? "Creating..." : "Create Problem"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default CreateProblem;
