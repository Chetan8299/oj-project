import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../store/slices/userSlice";

const Navbar = () => {
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await dispatch(logoutUser());
        navigate("/");
        setIsMobileMenuOpen(false);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            onClick={closeMobileMenu}
                        >
                            <img
                                src="/logo.png"
                                alt="AlgoVerse"
                                className="h-8 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/problems"
                            className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Problems
                        </Link>
                        {isAuthenticated &&
                            (user?.role === "setter" ||
                                user?.role === "admin") && (
                                <>
                                    <Link
                                        to="/my-problems"
                                        className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        My Problems
                                    </Link>
                                    <Link
                                        to="/create-problem"
                                        className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Create Problem
                                    </Link>
                                </>
                            )}
                        {isAuthenticated && user?.role === "admin" && (
                            <Link
                                to="/admin/users"
                                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Manage Users
                            </Link>
                        )}
                    </div>

                    {/* Desktop User Actions */}
                    <div className="hidden md:flex items-center space-x-4">
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
                                    <span className="text-slate-700 text-sm font-medium">
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
                        <button
                            onClick={toggleMobileMenu}
                            className="text-slate-600 hover:text-slate-900 p-2 rounded-md"
                        >
                            {isMobileMenuOpen ? (
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            ) : (
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
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-200">
                            {/* Mobile Navigation Links */}
                            <Link
                                to="/"
                                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={closeMobileMenu}
                            >
                                Home
                            </Link>
                            <Link
                                to="/problems"
                                className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                onClick={closeMobileMenu}
                            >
                                Problems
                            </Link>
                            {isAuthenticated &&
                                (user?.role === "setter" ||
                                    user?.role === "admin") && (
                                    <>
                                        <Link
                                            to="/my-problems"
                                            className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            My Problems
                                        </Link>
                                        <Link
                                            to="/create-problem"
                                            className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            Create Problem
                                        </Link>
                                    </>
                                )}
                            {isAuthenticated && user?.role === "admin" && (
                                <Link
                                    to="/admin/users"
                                    className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                    onClick={closeMobileMenu}
                                >
                                    Manage Users
                                </Link>
                            )}

                            {/* Mobile User Actions */}
                            <div className="pt-4 pb-3 border-t border-slate-200">
                                {isAuthenticated ? (
                                    <div className="space-y-3">
                                        <Link
                                            to="/profile"
                                            className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            <img
                                                src={
                                                    user?.avatar ||
                                                    "https://images.unsplash.com/photo-1740252117012-bb53ad05e370?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }
                                                alt={user?.name || "User"}
                                                className="w-8 h-8 rounded-full border border-slate-300"
                                            />
                                            <span className="text-slate-700 text-base font-medium">
                                                {user?.name || user?.username}
                                            </span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-base font-medium transition-colors"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <Link
                                            to="/login"
                                            className="text-slate-600 hover:text-slate-900 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="bg-blue-600 hover:bg-blue-700 text-white block px-3 py-2 rounded-md text-base font-medium transition-colors"
                                            onClick={closeMobileMenu}
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
