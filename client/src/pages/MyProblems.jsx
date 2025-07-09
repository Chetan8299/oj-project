import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const MyProblems = () => {
    const { loading, error, execute } = useApiCall();
    const { isAuthenticated } = useSelector((state) => state.user);
    const [problems, setProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: "all",
        search: "",
    });
    const [deleteConfirm, setDeleteConfirm] = useState({
        show: false,
        problemId: null,
        problemTitle: "",
    });
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchMyProblems = async () => {
            if (isAuthenticated) {
                await execute(
                    () => problemService.getMyProblems(),
                    (response) => {
                        if (response.success) {
                            setProblems(response.data);
                        }
                    }
                );
            }
        };

        fetchMyProblems();
    }, [execute, isAuthenticated]);

    const handleDeleteClick = (problem) => {
        setDeleteConfirm({
            show: true,
            problemId: problem._id,
            problemTitle: problem.title,
        });
    };

    const handleDeleteConfirm = async () => {
        setDeleting(deleteConfirm.problemId);
        try {
            const response = await problemService.deleteProblem(
                deleteConfirm.problemId
            );
            if (response.success) {
                // Remove from local state
                setProblems(
                    problems.filter((p) => p._id !== deleteConfirm.problemId)
                );
                setDeleteConfirm({
                    show: false,
                    problemId: null,
                    problemTitle: "",
                });
            }
        } catch (error) {
            console.error("Failed to delete problem:", error);
            alert("Failed to delete problem. Please try again.");
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, problemId: null, problemTitle: "" });
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "Easy":
                return "text-green-500 bg-green-50";
            case "Medium":
                return "text-yellow-600 bg-yellow-50";
            case "Hard":
                return "text-red-500 bg-red-50";
            default:
                return "text-gray-500 bg-gray-50";
        }
    };

    const filteredProblems = problems.filter((problem) => {
        if (
            filters.difficulty !== "all" &&
            problem.difficulty !== filters.difficulty
        )
            return false;
        if (
            filters.search &&
            !problem.title.toLowerCase().includes(filters.search.toLowerCase())
        )
            return false;
        return true;
    });

    if (!isAuthenticated) {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg p-4 text-center">
                        <h2 className="text-lg font-medium mb-2">
                            Authentication Required
                        </h2>
                        <p>Please log in to view your problems.</p>
                        <Link
                            to="/login"
                            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </Link>
                    </div>
                </div>
            </Layout>
        );
    }

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
                        {error}
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            My Problems
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage problems you've created ({problems.length}{" "}
                            total)
                        </p>
                    </div>
                    <Link
                        to="/create-problem"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                        Create New Problem
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search your problems..."
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <select
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.difficulty}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    difficulty: e.target.value,
                                }))
                            }
                        >
                            <option value="all">All Difficulties</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </div>
                </div>

                {/* Problems Grid */}
                {filteredProblems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProblems.map((problem) => (
                            <div
                                key={problem._id}
                                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                                            {problem.title}
                                        </h3>
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                                problem.difficulty
                                            )}`}
                                        >
                                            {problem.difficulty}
                                        </span>
                                    </div>

                                    {/* Description Preview */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {problem.description?.length > 100
                                            ? `${problem.description.substring(
                                                  0,
                                                  100
                                              )}...`
                                            : problem.description}
                                    </p>

                                    {/* Tags */}
                                    {problem.tags &&
                                        problem.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-4">
                                                {problem.tags
                                                    .slice(0, 3)
                                                    .map((tag, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                {problem.tags.length > 3 && (
                                                    <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs rounded">
                                                        +
                                                        {problem.tags.length -
                                                            3}{" "}
                                                        more
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <span>
                                            {problem.sampleTestCases?.length ||
                                                0}{" "}
                                            sample test
                                            {problem.sampleTestCases?.length !==
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                        <span>
                                            {problem.hiddenTestCases?.length ||
                                                0}{" "}
                                            hidden test
                                            {problem.hiddenTestCases?.length !==
                                            1
                                                ? "s"
                                                : ""}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/problems/${problem._id}`}
                                            className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium text-center hover:bg-gray-200 transition-colors"
                                        >
                                            View
                                        </Link>
                                        <Link
                                            to={`/edit-problem/${problem._id}`}
                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium text-center hover:bg-blue-700 transition-colors"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDeleteClick(problem)
                                            }
                                            disabled={deleting === problem._id}
                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {deleting === problem._id
                                                ? "..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>

                                {/* Created date */}
                                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                                    <p className="text-xs text-gray-500">
                                        Created{" "}
                                        {new Date(
                                            problem.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
                            <svg
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                className="w-full h-full"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {filters.search || filters.difficulty !== "all"
                                ? "No problems match your filters"
                                : "No problems created yet"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filters.search || filters.difficulty !== "all"
                                ? "Try adjusting your search or filter criteria."
                                : "Create your first coding problem to get started."}
                        </p>
                        {!filters.search && filters.difficulty === "all" && (
                            <Link
                                to="/create-problem"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                Create Your First Problem
                            </Link>
                        )}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm.show && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Modal panel */}
                            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg
                                            className="h-6 w-6 text-red-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.08 16.5c-.77.833.192 2.5 1.732 2.5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Delete Problem
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to delete
                                                "
                                                <strong>
                                                    {deleteConfirm.problemTitle}
                                                </strong>
                                                "? This action cannot be undone
                                                and will also delete all
                                                submissions for this problem.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                                        onClick={handleDeleteConfirm}
                                        disabled={deleting !== null}
                                    >
                                        {deleting !== null
                                            ? "Deleting..."
                                            : "Delete"}
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                                        onClick={handleDeleteCancel}
                                        disabled={deleting !== null}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyProblems;
