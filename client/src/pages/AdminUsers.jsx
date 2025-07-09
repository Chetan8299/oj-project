import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Layout } from "../components";
import { useApiCall } from "../hooks";
import userService from "../services/userService";

const AdminUsers = () => {
    const { loading, error, execute } = useApiCall();
    const { isAuthenticated, user } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [filters, setFilters] = useState({
        role: "all",
        search: "",
    });
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (isAuthenticated && user?.role === "admin") {
                const params = {
                    page: pagination.currentPage,
                    limit: pagination.limit,
                    ...(filters.role !== "all" && { role: filters.role }),
                    ...(filters.search && { search: filters.search }),
                };

                await execute(
                    () => userService.getAllUsers(params),
                    (response) => {
                        if (response.success) {
                            setUsers(response.data.users);
                            setPagination(response.data.pagination);
                        }
                    }
                );
            }
        };

        fetchUsers();
    }, [execute, isAuthenticated, user, pagination.currentPage, filters]);

    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, currentPage: newPage }));
    };

    const handleFilterChange = (filterName, value) => {
        setFilters((prev) => ({ ...prev, [filterName]: value }));
        setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
    };

    const handleRoleUpdate = async (userId, newRole) => {
        setUpdating(userId);
        try {
            const response = await userService.updateUserRole(userId, newRole);
            if (response.success) {
                // Update the local state
                setUsers(
                    users.map((u) =>
                        u._id === userId ? { ...u, role: newRole } : u
                    )
                );
            }
        } catch (error) {
            console.error("Failed to update user role:", error);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800";
            case "setter":
                return "bg-blue-100 text-blue-800";
            case "user":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Check if user is admin
    if (!isAuthenticated || user?.role !== "admin") {
        return (
            <Layout>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-center">
                        <h2 className="text-lg font-medium mb-2">
                            Access Denied
                        </h2>
                        <p>You need admin privileges to access this page.</p>
                        <Link
                            to="/"
                            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Go Home
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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        User Management
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Manage user roles and permissions ({users.length} total
                        users)
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="p-4 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search by username or email..."
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={filters.search}
                                onChange={(e) =>
                                    handleFilterChange("search", e.target.value)
                                }
                            />
                        </div>
                        <select
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.role}
                            onChange={(e) =>
                                handleFilterChange("role", e.target.value)
                            }
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="setter">Setter</option>
                            <option value="user">User</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Current Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img
                                                className="h-10 w-10 rounded-full"
                                                src={
                                                    u.avatar ||
                                                    "https://images.unsplash.com/photo-1740252117012-bb53ad05e370?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                                }
                                                alt=""
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {u.name || u.username}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    @{u.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {u.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(
                                                u.role
                                            )}`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(
                                            u.createdAt
                                        ).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {u._id !== user._id ? (
                                            <div className="flex items-center space-x-2">
                                                {u.role !== "setter" && (
                                                    <button
                                                        onClick={() =>
                                                            handleRoleUpdate(
                                                                u._id,
                                                                "setter"
                                                            )
                                                        }
                                                        disabled={
                                                            updating === u._id
                                                        }
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === u._id
                                                            ? "..."
                                                            : "Make Setter"}
                                                    </button>
                                                )}
                                                {u.role !== "user" && (
                                                    <button
                                                        onClick={() =>
                                                            handleRoleUpdate(
                                                                u._id,
                                                                "user"
                                                            )
                                                        }
                                                        disabled={
                                                            updating === u._id
                                                        }
                                                        className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === u._id
                                                            ? "..."
                                                            : "Make User"}
                                                    </button>
                                                )}
                                                {u.role !== "admin" && (
                                                    <button
                                                        onClick={() =>
                                                            handleRoleUpdate(
                                                                u._id,
                                                                "admin"
                                                            )
                                                        }
                                                        disabled={
                                                            updating === u._id
                                                        }
                                                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === u._id
                                                            ? "..."
                                                            : "Make Admin"}
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">
                                                You
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {users.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No users found matching your criteria
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white rounded-lg shadow mt-6 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing page {pagination.currentPage} of{" "}
                                {pagination.totalPages} ({pagination.totalUsers}{" "}
                                total users)
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage - 1
                                        )
                                    }
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>

                                {/* Page numbers */}
                                <div className="flex space-x-1">
                                    {Array.from(
                                        {
                                            length: Math.min(
                                                5,
                                                pagination.totalPages
                                            ),
                                        },
                                        (_, i) => {
                                            const pageNum = Math.max(
                                                1,
                                                Math.min(
                                                    pagination.currentPage -
                                                        2 +
                                                        i,
                                                    pagination.totalPages -
                                                        4 +
                                                        i
                                                )
                                            );
                                            return pageNum <=
                                                pagination.totalPages ? (
                                                <button
                                                    key={pageNum}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            pageNum
                                                        )
                                                    }
                                                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                                                        pageNum ===
                                                        pagination.currentPage
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ) : null;
                                        }
                                    )}
                                </div>

                                <button
                                    onClick={() =>
                                        handlePageChange(
                                            pagination.currentPage + 1
                                        )
                                    }
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Role Information */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                        Role Information
                    </h3>
                    <div className="text-sm text-blue-700 space-y-1">
                        <p>
                            <strong>Admin:</strong> Full access to all features
                            including user management
                        </p>
                        <p>
                            <strong>Setter:</strong> Can create and edit
                            problems
                        </p>
                        <p>
                            <strong>User:</strong> Can solve problems and view
                            content
                        </p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminUsers;
