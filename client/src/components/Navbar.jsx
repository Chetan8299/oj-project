import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/userSlice";
import authService from "../services/authService";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
            dispatch(logout());
            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if the API call fails, clear the local state
            dispatch(logout());
            navigate("/");
        }
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-slate-800 hover:text-slate-900 transition-colors"
                        >
                            AlgoVerse
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Home
                        </Link>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/problems"
                                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Problems
                                </Link>
                                <Link
                                    to="/submissions"
                                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Submissions
                                </Link>
                                <Link
                                    to="/create-problem"
                                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Create Problem
                                </Link>
                            </>
                        )}
                    </div>

                    {/* User Actions */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/profile"
                                    className="flex items-center space-x-2 hover:bg-slate-50 px-3 py-2 rounded-md transition-colors"
                                >
                                    <img
                                        src={
                                            user?.avatar ||
                                            "https://images.unsplash.com/photo-1740252117012-bb53ad05e370?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                        }
                                        alt={user?.name || "User"}
                                        className="w-8 h-8 rounded-full border border-slate-300"
                                    />
                                    <span className="text-slate-700 text-sm font-medium hidden sm:block">
                                        {user?.name || user?.username}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-slate-600 hover:text-slate-900 p-2 rounded-md">
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
