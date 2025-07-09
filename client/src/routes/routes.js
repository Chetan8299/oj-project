const ApiRoutes = {
    auth: {
        login: "/api/v1/users/login",
        register: "/api/v1/users/register",
        logout: "/api/v1/users/logout",
    },
    user: {
        getUser: "/api/v1/users/user",
        updateUser: "/api/v1/users/user",
        getAllUsers: "/api/v1/users/admin/users",
        updateUserRole: (userId) => `/api/v1/users/admin/users/${userId}/role`,
    },
    problems: {
        create: "/api/v1/problems",
        getAll: "/api/v1/problems",
        getMy: "/api/v1/problems/my-problems",
        getById: (id) => `/api/v1/problems/${id}`,
        update: (id) => `/api/v1/problems/${id}`,
        delete: (id) => `/api/v1/problems/${id}`,
        submit: (id) => `/api/v1/problems/${id}/submit`,
        getSubmissions: (id) => `/api/v1/problems/${id}/submissions`,
    },
    compiler: {
        execute: "/api/v1/compiler/execute",
        executeTests: "/api/v1/compiler/execute-tests",
        languages: "/api/v1/compiler/languages",
    },
    ai: {
        reviewCode: "/api/v1/ai/review-code",
    },
};

export default ApiRoutes;
