const ApiRoutes = {
    auth: {
        login: "/api/v1/users/login",
        register: "/api/v1/users/register",
        logout: "/api/v1/users/logout",
    },
    user: {
        getUser: "/api/v1/users/user",
        updateUser: "/api/v1/users/user",
    },
    problems: {
        create: "/api/v1/problems",
        getAll: "/api/v1/problems",
        getById: (id) => `/api/v1/problems/${id}`,
        update: (id) => `/api/v1/problems/${id}`,
        execute: "/api/v1/compiler/execute"
    },
};

export default ApiRoutes;
