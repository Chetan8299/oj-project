import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const Problems = () => {
    const { loading, error, execute } = useApiCall();
    const [problems, setProblems] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: "all",
        status: "all",
        search: "",
    });

    useEffect(() => {
        const fetchProblems = async () => {
            await execute(
                () => problemService.getAllProblems(),
                (response) => {
                    if (response.success) {
                        setProblems(response.data);
                    }
                }
            );
        };

        fetchProblems();
    }, [execute]);

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

    const getStatusIcon = (status) => {
        switch (status) {
            case "Solved":
                return (
                    <svg
                        className="w-5 h-5 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            case "Attempted":
                return (
                    <svg
                        className="w-5 h-5 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
            default:
                return (
                    <svg
                        className="w-5 h-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                            clipRule="evenodd"
                        />
                    </svg>
                );
        }
    };

    const filteredProblems = problems.filter((problem) => {
        if (
            filters.difficulty !== "all" &&
            problem.difficulty !== filters.difficulty
        )
            return false;
        if (filters.status !== "all" && problem.status !== filters.status)
            return false;
        if (
            filters.search &&
            !problem.title.toLowerCase().includes(filters.search.toLowerCase())
        )
            return false;
        return true;
    });

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
                    <h1 className="text-2xl font-bold text-gray-900">
                        Problem Set
                    </h1>
                    <Link
                        to="/problems/create"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Create Problem
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search problems..."
                                className="w-full px-4 py-2 border rounded-lg"
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
                            className="px-4 py-2 border rounded-lg"
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
                        <select
                            className="px-4 py-2 border rounded-lg"
                            value={filters.status}
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    status: e.target.value,
                                }))
                            }
                        >
                            <option value="all">All Status</option>
                            <option value="Solved">Solved</option>
                            <option value="Attempted">Attempted</option>
                            <option value="Unsolved">Unsolved</option>
                        </select>
                    </div>
                </div>

                {/* Problems Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Difficulty
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Acceptance
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredProblems.map((problem) => (
                                <tr
                                    key={problem._id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusIcon(problem.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            to={`/problems/${problem._id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            {problem.title}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`font-medium ${getDifficultyColor(
                                                problem.difficulty
                                            )}`}
                                        >
                                            {problem.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {problem.acceptanceRate || "N/A"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredProblems.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No problems found matching your criteria
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Problems;
