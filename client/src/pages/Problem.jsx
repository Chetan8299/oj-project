import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const Problem = () => {
    const { id } = useParams();
    const { loading, error, execute } = useApiCall();
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("cpp");
    const [code, setCode] = useState("");
    const [executionResult, setExecutionResult] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [input, setInput] = useState("");

    const languages = [
        { value: "js", label: "JavaScript" },
        { value: "py", label: "Python" },
        { value: "java", label: "Java" },
        { value: "cpp", label: "C++" },
        { value: "c", label: "C" },
        { value: "cs", label: "C#" },
        { value: "go", label: "Go" },
        { value: "rs", label: "Rust" },
        { value: "php", label: "PHP" },
        { value: "rb", label: "Ruby" },
    ];

    useEffect(() => {
        const fetchProblem = async () => {
            await execute(
                () => problemService.getProblemById(id),
                (response) => {
                    if (response.success) {
                        setProblem(response.data);
                    }
                }
            );
        };

        if (id) {
            fetchProblem();
        }
    }, [id, execute]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy":
                return "text-green-600 bg-green-100";
            case "Medium":
                return "text-yellow-600 bg-yellow-100";
            case "Hard":
                return "text-red-600 bg-red-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            alert("Please write some code first!");
            return;
        }

        setExecuting(true);
        setExecutionResult(null);

        try {
            await execute(
                () => problemService.executeCode(code, selectedLanguage, input),
                (response) => {
                    setExecutionResult(response);
                }
            );
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmitSolution = () => {
        if (!code.trim()) {
            alert("Please write some code first!");
            return;
        }
        // TODO: Implement solution submission to backend
        console.log("Submitting solution:", {
            problemId: id,
            language: selectedLanguage,
            code,
        });
        alert("Solution submission feature will be implemented soon!");
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium mb-2">
                            Error Loading Problem
                        </h3>
                        <p className="mb-4">{error}</p>
                        <Link
                            to="/problems"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ← Back to Problems
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!problem) {
        return (
            <Layout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium mb-2">
                            Problem Not Found
                        </h3>
                        <p className="mb-4">
                            The problem you're looking for doesn't exist.
                        </p>
                        <Link
                            to="/problems"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ← Back to Problems
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        to="/problems"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Problems
                    </Link>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-3xl font-bold text-slate-900">
                                {problem.title}
                            </h1>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                                    problem.difficulty
                                )}`}
                            >
                                {problem.difficulty}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Problem Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                Problem Description
                            </h2>
                            <div className="prose prose-slate max-w-none">
                                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                                    {problem.description}
                                </p>
                            </div>
                        </div>

                        {/* Sample Test Cases */}
                        {problem.sampleTestCases &&
                            problem.sampleTestCases.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                    <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                        Sample Test Cases
                                    </h2>
                                    <div className="space-y-4">
                                        {problem.sampleTestCases.map(
                                            (testCase, index) => (
                                                <div
                                                    key={index}
                                                    className="border border-slate-200 rounded-lg p-4"
                                                >
                                                    <h3 className="font-medium text-slate-900 mb-2">
                                                        Example {index + 1}
                                                    </h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                Input:
                                                            </label>
                                                            <pre className="bg-slate-50 p-3 rounded border text-sm font-mono text-slate-800 overflow-x-auto">
                                                                {testCase.input}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                Output:
                                                            </label>
                                                            <pre className="bg-slate-50 p-3 rounded border text-sm font-mono text-slate-800 overflow-x-auto">
                                                                {
                                                                    testCase.output
                                                                }
                                                            </pre>
                                                        </div>
                                                    </div>
                                                    {testCase.explanation && (
                                                        <div className="mt-3">
                                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                                Explanation:
                                                            </label>
                                                            <p className="text-slate-600 text-sm">
                                                                {
                                                                    testCase.explanation
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Constraints */}
                        {problem.constraints && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                    Constraints
                                </h2>
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-slate-700 whitespace-pre-wrap">
                                        {problem.constraints}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Code Editor Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-xl font-semibold text-slate-900 mb-4">
                                Solution
                            </h2>

                            {/* Language Selector */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Programming Language
                                </label>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) =>
                                        setSelectedLanguage(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    {languages.map((lang) => (
                                        <option
                                            key={lang.value}
                                            value={lang.value}
                                        >
                                            {lang.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Code Editor */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Your Code
                                </label>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder={`// Write your ${
                                        languages.find(
                                            (lang) =>
                                                lang.value === selectedLanguage
                                        )?.label
                                    } solution here\nfunction solution() {\n    // Your code here\n}`}
                                    className="w-full h-64 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
                                    style={{
                                        fontFamily:
                                            'Monaco, Menlo, "Ubuntu Mono", monospace',
                                        lineHeight: "1.5",
                                    }}
                                />
                            </div>

                            {/* Input Section */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Input (optional)
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Enter your input here..."
                                    className="w-full h-20 px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm resize-none"
                                    style={{
                                        fontFamily:
                                            'Monaco, Menlo, "Ubuntu Mono", monospace',
                                        lineHeight: "1.5",
                                    }}
                                />
                            </div>

                            {/* Execution Result */}
                            {executionResult && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-slate-700 mb-2">
                                        Execution Result
                                    </h3>
                                    <div
                                        className={`rounded-lg p-4 ${
                                            executionResult.success
                                                ? "bg-green-50 border border-green-200"
                                                : "bg-red-50 border border-red-200"
                                        }`}
                                    >
                                        {executionResult.success ? (
                                            <>
                                                <div className="text-green-700 font-medium mb-2">
                                                    {executionResult.message}
                                                </div>
                                                {executionResult.output && (
                                                    <div className="bg-white rounded border border-green-200 p-3">
                                                        <pre className="text-sm font-mono whitespace-pre-wrap">
                                                            {
                                                                executionResult.output
                                                            }
                                                        </pre>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <div className="text-red-700 font-medium mb-2">
                                                    {executionResult.message}
                                                </div>
                                                {executionResult.error && (
                                                    <div className="bg-white rounded border border-red-200 p-3">
                                                        <pre className="text-sm font-mono whitespace-pre-wrap text-red-600">
                                                            {
                                                                executionResult.error
                                                            }
                                                        </pre>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Code Actions */}
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRunCode}
                                    disabled={executing}
                                    className={`flex-1 ${
                                        executing
                                            ? "bg-blue-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    } text-white px-4 py-2 rounded-lg font-medium transition-colors`}
                                >
                                    {executing ? "Running..." : "Run Code"}
                                </button>
                                <button
                                    onClick={() => handleSubmitSolution()}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Submit Solution
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Problem Stats */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Problem Details
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">
                                        Difficulty:
                                    </span>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                            problem.difficulty
                                        )}`}
                                    >
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">
                                        Test Cases:
                                    </span>
                                    <span className="text-slate-900 font-medium">
                                        {problem.sampleTestCases?.length || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {problem.tags && problem.tags.length > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                    Tags
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">
                                Actions
                            </h3>
                            <div className="space-y-3">
                                <button className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Save for Later
                                </button>
                                <button className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                    Add to Favorites
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Problem;
