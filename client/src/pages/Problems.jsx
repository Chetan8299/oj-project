import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import problemService from "../services/problemService";

const Problems = () => {
    const { loading, error, execute } = useApiCall();
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("All");
    const [selectedTag, setSelectedTag] = useState("All");

    // Get unique tags from all problems
    const allTags = [...new Set(problems.flatMap((problem) => problem.tags))];

    useEffect(() => {
        const fetchProblems = async () => {
            await execute(
                () => problemService.getAllProblems(),
                (response) => {
                    if (response.success) {
                        setProblems(response.data);
                        setFilteredProblems(response.data);
                    }
                }
            );
        };

        fetchProblems();
    }, [execute]);

    // Filter problems based on search term, difficulty, and tag
    useEffect(() => {
        let filtered = problems;

        if (searchTerm) {
            filtered = filtered.filter(
                (problem) =>
                    problem.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    problem.description
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        if (selectedDifficulty !== "All") {
            filtered = filtered.filter(
                (problem) => problem.difficulty === selectedDifficulty
            );
        }

        if (selectedTag !== "All") {
            filtered = filtered.filter((problem) =>
                problem.tags.includes(selectedTag)
            );
        }

        setFilteredProblems(filtered);
    }, [problems, searchTerm, selectedDifficulty, selectedTag]);

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

    if (loading) {
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                Problems
                            </h1>
                            <p className="text-slate-600">
                                Practice coding problems to improve your
                                algorithmic skills
                            </p>
                        </div>
                        <Link
                            to="/create-problem"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            + Create Problem
                        </Link>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Search Problems
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title or description..."
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) =>
                                    setSelectedDifficulty(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="All">All Difficulties</option>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Tag
                            </label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                                <option value="All">All Tags</option>
                                {allTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <div className="text-sm text-slate-600">
                                Showing {filteredProblems.length} of{" "}
                                {problems.length} problems
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems List */}
                {filteredProblems.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                            No problems found
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {problems.length === 0
                                ? "No problems have been created yet."
                                : "Try adjusting your search criteria."}
                        </p>
                        {problems.length === 0 && (
                            <Link
                                to="/create-problem"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create the first problem
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredProblems.map((problem) => (
                            <div
                                key={problem._id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                                                <Link
                                                    to={`/problems/${problem._id}`}
                                                >
                                                    {problem.title}
                                                </Link>
                                            </h3>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                                    problem.difficulty
                                                )}`}
                                            >
                                                {problem.difficulty}
                                            </span>
                                        </div>

                                        <p className="text-slate-600 mb-4 line-clamp-2">
                                            {problem.description.length > 200
                                                ? `${problem.description.substring(
                                                      0,
                                                      200
                                                  )}...`
                                                : problem.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2">
                                            {problem.tags
                                                .slice(0, 3)
                                                .map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            {problem.tags.length > 3 && (
                                                <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded-md text-xs">
                                                    +{problem.tags.length - 3}{" "}
                                                    more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-6 flex flex-col items-end space-y-2">
                                        <Link
                                            to={`/problems/${problem._id}`}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Solve
                                        </Link>
                                        <div className="text-xs text-slate-500">
                                            {problem.sampleTestCases?.length ||
                                                0}{" "}
                                            test cases
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Problems;
