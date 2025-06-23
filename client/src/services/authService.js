import axiosInstance from "../utils/axios";
import ApiRoutes from "../routes/routes";

const authService = {
    login: async (email, password) => {
        const response = await axiosInstance.post(ApiRoutes.auth.login, {
            email,
            password,
        });
        return response.data;
    },
    register: async (email, password, name, username) => {
        const response = await axiosInstance.post(ApiRoutes.auth.register, {
            name,
            username,
            email,
            password,
        });
        return response.data;
    },
    logout: async () => {
        const response = await axiosInstance.post(ApiRoutes.auth.logout);
        return response.data;
    },
    getUser: async () => {
        const response = await axiosInstance.get(ApiRoutes.user.getUser);
        return response.data;
    },
    updateUser: async (name, username, email, avatar) => {
        const response = await axiosInstance.put(ApiRoutes.user.updateUser, {
            name,
            username,
            email,
            avatar, 
        });
        return response.data;
    },
};

export default authService;
