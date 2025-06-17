import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useApiCall } from "../hooks";
import { Layout } from "../components";

const Signup = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const { loading, error, execute, setError } = useApiCall();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Handle signup logic here
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        await execute(
            () =>
                authService.register(
                    formData.email,
                    formData.password,
                    formData.fullName,
                    formData.username
                ),
            (response) => {
                if (response.success) {
                    navigate("/login");
                } else {
                    setError(response.message);
                }
            }
        );
    };

    return (
        <Layout showNavbar={false}>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-block">
                            <h1 className="text-4xl font-bold text-slate-800 mb-2">
                                AlgoVerse
                            </h1>
                        </Link>
                        <h2 className="text-2xl font-semibold text-slate-700 mb-2">
                            Create your account
                        </h2>
                        <p className="text-slate-600">
                            Join thousands of developers improving their coding
                            skills
                        </p>
                    </div>

                    {/* Signup Form */}
                    <div className="bg-white py-8 px-6 shadow-lg rounded-xl border border-slate-200">
                        {error && (
                            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Choose a username"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Create a password"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Confirm your password"
                                />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                                />
                                <label
                                    htmlFor="terms"
                                    className="ml-2 block text-sm text-slate-700"
                                >
                                    I agree to the{" "}
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="#"
                                        className="text-blue-600 hover:text-blue-500 font-medium"
                                    >
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "Creating account..."
                                    : "Create account"}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-500">
                                        Already have an account?
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Sign in here
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Signup;
