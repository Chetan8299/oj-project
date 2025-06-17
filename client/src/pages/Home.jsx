import React from "react";
import { Link } from "react-router-dom";
import { Layout } from "../components";

const Home = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center">
                    <h2 className="text-5xl font-bold text-slate-900 mb-6">
                        Master Algorithms & Data Structures
                    </h2>
                    <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
                        Practice coding problems, improve your skills, and
                        prepare for technical interviews with our comprehensive
                        online judge platform.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link
                            to="/signup"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
                        >
                            Start Practicing
                        </Link>
                        <button className="border border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors">
                            View Problems
                        </button>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Curated Problems
                        </h3>
                        <p className="text-slate-600">
                            Hand-picked algorithmic challenges from easy to
                            expert level to help you grow progressively.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Instant Feedback
                        </h3>
                        <p className="text-slate-600">
                            Get immediate results with detailed test case
                            feedback and execution time analysis.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                            <svg
                                className="w-6 h-6 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Track Progress
                        </h3>
                        <p className="text-slate-600">
                            Monitor your improvement with detailed statistics
                            and performance analytics.
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
