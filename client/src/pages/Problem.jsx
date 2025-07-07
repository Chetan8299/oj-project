import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";
import * as compilerService from "../services/compilerService";

const Problem = () => {
    const { id } = useParams();
    const { loading, error, execute } = useApiCall();
    const [problem, setProblem] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState("cpp");
    const [code, setCode] = useState("");
    const [executionResult, setExecutionResult] = useState(null);
    const [executing, setExecuting] = useState(false);
    const [input, setInput] = useState("");
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [leftActiveTab, setLeftActiveTab] = useState("description"); // description, submissions
    const [rightActiveTab, setRightActiveTab] = useState("code"); // code, result
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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

    useEffect(() => {
        const fetchSubmissions = async () => {
            setLoadingSubmissions(true);
            try {
                const response = await problemService.getProblemSubmissions(id);
                if (response.success) {
                    setSubmissions(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch submissions:", error);
            } finally {
                setLoadingSubmissions(false);
            }
        };

        if (id) {
            fetchSubmissions();
        }
    }, [id]);

    useEffect(() => {
        // Check if user is authenticated by trying to fetch submissions
        const checkAuth = async () => {
            try {
                await problemService.getProblemSubmissions(id);
                setIsAuthenticated(true);
            } catch {
                setIsAuthenticated(false);
                // Don't show error for auth check
            }
        };

        if (id) {
            checkAuth();
        }
    }, [id]);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy":
                return "text-green-500";
            case "Medium":
                return "text-yellow-500";
            case "Hard":
                return "text-red-500";
            default:
                return "text-gray-500";
        }
    };

    const handleRunCode = async () => {
        if (!code.trim()) {
            alert("Please write some code first!");
            return;
        }

        if (!isAuthenticated) {
            alert("Please login to run and submit code!");
            return;
        }

        setExecuting(true);
        setExecutionResult(null);

        try {
            const result = await compilerService.executeCode(
                code,
                selectedLanguage,
                input
            );
            setExecutionResult({
                success: result.success,
                message: result.message,
                output: result.output,
                error: result.error,
            });
        } catch (error) {
            setExecutionResult({
                success: false,
                message:
                    error.response?.data?.message || "Failed to execute code",
                error: error.response?.data?.error,
            });
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmitSolution = async () => {
        if (!code.trim()) {
            alert("Please write some code first!");
            return;
        }

        if (!isAuthenticated) {
            alert("Please login to run and submit code!");
            return;
        }

        setExecuting(true);
        setExecutionResult(null);

        try {
            const result = await problemService.submitSolution({
                problemId: id,
                code,
                language: selectedLanguage,
            });

            if (result.success) {
                setExecutionResult({
                    success: true,
                    message: result.message,
                    results: result.data.results,
                    summary: result.data.summary,
                    passed: result.data.passed,
                });

                // Refresh submissions after successful submission
                const submissionsResponse =
                    await problemService.getProblemSubmissions(id);
                if (submissionsResponse.success) {
                    setSubmissions(submissionsResponse.data);
                }
            } else {
                setExecutionResult({
                    success: false,
                    message: result.message,
                });
            }
        } catch (error) {
            setExecutionResult({
                success: false,
                message:
                    error.response?.data?.message ||
                    "Failed to submit solution",
            });
        } finally {
            setExecuting(false);
        }
    };

    const handleViewCode = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
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

    if (error || !problem) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                        {error || "Problem not found"}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50">
                {/* Problem Header */}
                <div className="bg-white border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {problem.title}
                                    </h1>
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                                            problem.difficulty
                                        )}`}
                                    >
                                        {problem.difficulty}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                                    <span>
                                        Acceptance Rate:{" "}
                                        {problem.acceptanceRate || "N/A"}
                                    </span>
                                    <span>
                                        Submissions: {submissions.length}
                                    </span>
                                </div>
                            </div>
                            <Link
                                to="/problems"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                ← Back to Problems
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Problem Description */}
                        <div className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                            {/* Tabs */}
                            <div className="bg-white rounded-lg shadow sticky top-0 z-10">
                                <div className="border-b">
                                    <nav className="flex">
                                        <button
                                            onClick={() =>
                                                setLeftActiveTab("description")
                                            }
                                            className={`px-4 py-3 text-sm font-medium border-b-2 ${
                                                leftActiveTab === "description"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            Description
                                        </button>
                                        <button
                                            onClick={() =>
                                                setLeftActiveTab("submissions")
                                            }
                                            className={`px-4 py-3 text-sm font-medium border-b-2 ${
                                                leftActiveTab === "submissions"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            Submissions
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6">
                                    {leftActiveTab === "description" ? (
                                        <div className="space-y-6">
                                            <div className="prose max-w-none">
                                                <p className="whitespace-pre-wrap">
                                                    {problem.description}
                                                </p>
                                            </div>

                                            {problem.constraints && (
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        Constraints:
                                                    </h3>
                                                    <p className="text-gray-600 whitespace-pre-wrap">
                                                        {problem.constraints}
                                                    </p>
                                                </div>
                                            )}

                                            {problem.sampleTestCases?.length >
                                                0 && (
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                                                        Examples:
                                                    </h3>
                                                    <div className="space-y-4">
                                                        {problem.sampleTestCases.map(
                                                            (
                                                                testCase,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={index}
                                                                    className="bg-gray-50 rounded-lg p-4"
                                                                >
                                                                    <p className="font-medium text-gray-700 mb-2">
                                                                        Example{" "}
                                                                        {index +
                                                                            1}
                                                                        :
                                                                    </p>
                                                                    <div className="space-y-2">
                                                                        <div className="bg-white rounded border p-3">
                                                                            <p className="text-sm font-medium text-gray-700">
                                                                                Input:
                                                                            </p>
                                                                            <pre className="mt-1 text-sm text-gray-600">
                                                                                {
                                                                                    testCase.input
                                                                                }
                                                                            </pre>
                                                                        </div>
                                                                        <div className="bg-white rounded border p-3">
                                                                            <p className="text-sm font-medium text-gray-700">
                                                                                Output:
                                                                            </p>
                                                                            <pre className="mt-1 text-sm text-gray-600">
                                                                                {
                                                                                    testCase.output
                                                                                }
                                                                            </pre>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {loadingSubmissions ? (
                                                <div className="flex justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : submissions.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Status
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Language
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Time
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Memory
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Submitted
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                                    Action
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {submissions.map(
                                                                (
                                                                    submission
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            submission._id
                                                                        }
                                                                        className="hover:bg-gray-50"
                                                                    >
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span
                                                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                                    submission.status ===
                                                                                    "Accepted"
                                                                                        ? "bg-green-100 text-green-800"
                                                                                        : "bg-red-100 text-red-800"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    submission.status
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {
                                                                                submission.language
                                                                            }
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {
                                                                                submission.executionTime
                                                                            }
                                                                            ms
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {
                                                                                submission.memory
                                                                            }
                                                                            KB
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {new Date(
                                                                                submission.createdAt
                                                                            ).toLocaleString()}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleViewCode(
                                                                                        submission
                                                                                    )
                                                                                }
                                                                                className="text-blue-600 hover:text-blue-900"
                                                                            >
                                                                                View
                                                                                Code
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-center text-gray-500 py-8">
                                                    No submissions yet
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Code Editor */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow">
                                {/* Code Editor Tabs */}
                                <div className="border-b">
                                    <nav className="flex">
                                        <button
                                            onClick={() =>
                                                setRightActiveTab("code")
                                            }
                                            className={`px-4 py-3 text-sm font-medium border-b-2 ${
                                                rightActiveTab === "code"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            Code
                                        </button>
                                        <button
                                            onClick={() =>
                                                setRightActiveTab("result")
                                            }
                                            className={`px-4 py-3 text-sm font-medium border-b-2 ${
                                                rightActiveTab === "result"
                                                    ? "border-blue-500 text-blue-600"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                            }`}
                                        >
                                            Results
                                        </button>
                                    </nav>
                                </div>

                                <div className="p-6">
                                    {rightActiveTab === "code" ? (
                                        <>
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Language
                                                </label>
                                                <select
                                                    value={selectedLanguage}
                                                    onChange={(e) =>
                                                        setSelectedLanguage(
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Code
                                                </label>
                                                <textarea
                                                    value={code}
                                                    onChange={(e) =>
                                                        setCode(e.target.value)
                                                    }
                                                    className="w-full h-96 font-mono text-sm rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Write your code here..."
                                                />
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Custom Input
                                                </label>
                                                <textarea
                                                    value={input}
                                                    onChange={(e) =>
                                                        setInput(e.target.value)
                                                    }
                                                    className="w-full h-24 font-mono text-sm rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter custom input..."
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <button
                                                    onClick={handleRunCode}
                                                    disabled={executing}
                                                    className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                                                >
                                                    {executing
                                                        ? "Running..."
                                                        : "Run Code"}
                                                </button>
                                                <button
                                                    onClick={
                                                        handleSubmitSolution
                                                    }
                                                    disabled={executing}
                                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                >
                                                    {executing
                                                        ? "Submitting..."
                                                        : "Submit"}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        /* Execution Result Tab */
                                        <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                                            {executionResult ? (
                                                <div
                                                    className={`rounded-lg p-4 ${
                                                        executionResult.success
                                                            ? "bg-green-50"
                                                            : "bg-red-50"
                                                    }`}
                                                >
                                                    <h3 className="text-sm font-medium text-gray-900 mb-4">
                                                        Execution Result
                                                    </h3>
                                                    <p
                                                        className={`font-medium ${
                                                            executionResult.success
                                                                ? "text-green-700"
                                                                : "text-red-700"
                                                        }`}
                                                    >
                                                        {
                                                            executionResult.message
                                                        }
                                                    </p>

                                                    {executionResult.output && (
                                                        <div className="mt-4">
                                                            <h4 className="font-medium text-gray-900 mb-2">
                                                                Output:
                                                            </h4>
                                                            <pre className="bg-white rounded border p-3 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                                                                {
                                                                    executionResult.output
                                                                }
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {executionResult.error && (
                                                        <div className="mt-4">
                                                            <h4 className="font-medium text-red-700 mb-2">
                                                                Error:
                                                            </h4>
                                                            <pre className="bg-white rounded border border-red-100 p-3 font-mono text-sm text-red-600 whitespace-pre-wrap overflow-x-auto">
                                                                {
                                                                    executionResult.error
                                                                }
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {executionResult.results && (
                                                        <div className="mt-4">
                                                            <h4 className="font-medium text-gray-900 mb-2">
                                                                Test Results:
                                                            </h4>
                                                            <div className="mb-2">
                                                                <p className="text-sm text-gray-600">
                                                                    Passed{" "}
                                                                    {
                                                                        executionResult
                                                                            .summary
                                                                            .passed
                                                                    }
                                                                    of{" "}
                                                                    {
                                                                        executionResult
                                                                            .summary
                                                                            .total
                                                                    }
                                                                    test cases
                                                                    {executionResult
                                                                        .summary
                                                                        .maxMemory &&
                                                                        ` • Memory: ${executionResult.summary.maxMemory}KB`}
                                                                    {executionResult
                                                                        .summary
                                                                        .totalExecutionTime &&
                                                                        ` • Time: ${executionResult.summary.totalExecutionTime}ms`}
                                                                </p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {executionResult.results
                                                                    .filter(
                                                                        (
                                                                            result
                                                                        ) =>
                                                                            !result.passed
                                                                    )
                                                                    .map(
                                                                        (
                                                                            result,
                                                                            index
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    index
                                                                                }
                                                                                className="bg-white rounded border border-red-200 p-3"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                                                    <span className="font-medium">
                                                                                        Failed
                                                                                        Test
                                                                                        Case
                                                                                    </span>
                                                                                </div>
                                                                                <div className="mt-2 text-sm space-y-2">
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <p className="font-medium text-gray-700">
                                                                                            Input:
                                                                                        </p>
                                                                                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                                                                            {
                                                                                                result.input
                                                                                            }
                                                                                        </pre>
                                                                                    </div>
                                                                                    <div className="bg-gray-50 p-2 rounded">
                                                                                        <p className="font-medium text-gray-700">
                                                                                            Expected
                                                                                            Output:
                                                                                        </p>
                                                                                        <pre className="mt-1 text-gray-600 whitespace-pre-wrap">
                                                                                            {
                                                                                                result.expectedOutput
                                                                                            }
                                                                                        </pre>
                                                                                    </div>
                                                                                    <div className="bg-red-50 p-2 rounded">
                                                                                        <p className="font-medium text-red-700">
                                                                                            Your
                                                                                            Output:
                                                                                        </p>
                                                                                        <pre className="mt-1 text-red-600 whitespace-pre-wrap">
                                                                                            {
                                                                                                result.actualOutput
                                                                                            }
                                                                                        </pre>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-8">
                                                    No results yet. Run or
                                                    submit your code to see
                                                    results.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Viewing Modal */}
            {isModalOpen && selectedSubmission && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Modal panel */}
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full ">
                            {/* Header */}
                            <div className="bg-gray-100 px-4 py-3 sm:px-6 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Submission Code -{" "}
                                    {selectedSubmission.language.toUpperCase()}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Code content */}
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="w-full">
                                    <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                                        <pre className="text-sm font-mono text-gray-800 whitespace-pre">
                                            {selectedSubmission.code}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-100 px-4 py-3 sm:px-6 flex flex-row-reverse">
                                <button
                                    type="button"
                                    className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add login prompt */}
            {!isAuthenticated && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                Please{" "}
                                <Link
                                    to="/login"
                                    className="font-medium underline"
                                >
                                    login
                                </Link>{" "}
                                to run and submit code.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Problem;
