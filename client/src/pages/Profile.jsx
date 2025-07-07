import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import authService from "../services/authService";
import { setUser } from "../store/slices/userSlice";

const Profile = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { loading, error, execute } = useApiCall();
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        avatar: "",
    });

    // Fetch user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            await execute(
                () => authService.getUser(),
                (response) => {
                    if (response.success) {
                        const userData = response.data;
                        setFormData({
                            name: userData.name || "",
                            username: userData.username || "",
                            email: userData.email || "",
                            avatar: userData.avatar || "",
                        });
                        dispatch(setUser(userData));
                    }
                }
            );
        };

        fetchUserData();
    }, [dispatch, execute]); // Now safe to include execute since it's memoized

    // Update form data when user data changes from Redux
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                username: user.username || "",
                email: user.email || "",
                avatar: user.avatar || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear messages when user types
        setUpdateError("");
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        setUpdateError("");
        setSuccessMessage("");

        try {
            const response = await authService.updateUser(
                formData.name,
                formData.username,
                formData.email,
                formData.avatar
            );

            if (response.success) {
                dispatch(setUser(response.data));
                setSuccessMessage("Profile updated successfully!");
            } else {
                setUpdateError(response.message || "Failed to update profile");
            }
        } catch (err) {
            setUpdateError(
                err.response?.data?.message || "Failed to update profile"
            );
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout showNavbar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout showNavbar={false}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-slate-900">
                            My Profile
                        </h1>
                        <Link
                            to="/"
                            className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                    <p className="mt-2 text-slate-600">
                        Manage your account settings and preferences.
                    </p>
                </div>

                {/* Error Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {error}
                    </div>
                )}

                {updateError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                        {updateError}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg">
                        {successMessage}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <img
                                    src={
                                        formData.avatar ||
                                        "https://images.unsplash.com/photo-1740252117012-bb53ad05e370?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    }
                                    alt="Profile"
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">
                                    {formData.name || "User"}
                                </h2>
                                <p className="text-blue-100">
                                    @{formData.username || "username"}
                                </p>
                                <div className="flex items-center mt-2">
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span className="text-blue-100">
                                        {formData.email}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Section */}
                        <div className="mt-8 grid grid-cols-3 gap-4">
                            <div className="bg-white bg-opacity-10 rounded-lg p-4">
                                <div className="text-3xl font-bold text-black">
                                    {user?.stats?.problemsSolved || 0}
                                </div>
                                <div className="text-blue-500 text-sm">
                                    Problems Solved
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg p-4">
                                <div className="text-3xl font-bold text-black">
                                    {user?.stats?.totalSubmissions || 0}
                                </div>
                                <div className="text-blue-500 text-sm">
                                    Total Submissions
                                </div>
                            </div>
                            <div className="bg-white bg-opacity-10 rounded-lg p-4">
                                <div className="text-3xl font-bold text-black">
                                    {user?.stats?.acceptedSubmissions
                                        ? Math.round(
                                              (user.stats.acceptedSubmissions /
                                                  user.stats.totalSubmissions) *
                                                  100
                                          )
                                        : 0}
                                    %
                                </div>
                                <div className="text-blue-500 text-sm">
                                    Success Rate
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-slate-700 mb-2"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Enter your full name"
                                        required
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
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Choose a username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="avatar"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Avatar URL
                                </label>
                                <input
                                    type="url"
                                    id="avatar"
                                    name="avatar"
                                    value={formData.avatar}
                                    onChange={handleChange}
                                    className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="https://example.com/avatar.jpg"
                                />
                                <p className="mt-1 text-sm text-slate-500">
                                    Enter a URL to your profile picture
                                </p>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        // Reset form to original user data
                                        if (user) {
                                            setFormData({
                                                name: user.name || "",
                                                username: user.username || "",
                                                email: user.email || "",
                                                avatar: user.avatar || "",
                                            });
                                        }
                                        setUpdateError("");
                                        setSuccessMessage("");
                                    }}
                                    className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {updateLoading
                                        ? "Updating..."
                                        : "Update Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
