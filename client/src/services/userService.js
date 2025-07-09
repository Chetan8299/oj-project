import axios from "../utils/axios";
import ApiRoutes from "../routes/routes";

const userService = {
    // Admin endpoints
    getAllUsers: async (params = {}) => {
        const response = await axios.get(ApiRoutes.user.getAllUsers, {
            params,
        });
        return response.data;
    },

    updateUserRole: async (userId, role) => {
        const response = await axios.put(
            ApiRoutes.user.updateUserRole(userId),
            {
                role,
            }
        );
        return response.data;
    },
};

export default userService;
