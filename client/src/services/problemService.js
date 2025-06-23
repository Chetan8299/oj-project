import axiosInstance from "../utils/axios";
import ApiRoutes from "../routes/routes";

const problemService = {
    createProblem: async (problemData) => {
        const response = await axiosInstance.post(
            ApiRoutes.problems.create,
            problemData
        );
        return response.data;
    },

    getAllProblems: async () => {
        const response = await axiosInstance.get(ApiRoutes.problems.getAll);
        return response.data;
    },

    getProblemById: async (id) => {
        const response = await axiosInstance.get(
            ApiRoutes.problems.getById(id)
        );
        return response.data;
    },

    updateProblem: async (id, problemData) => {
        const response = await axiosInstance.put(
            ApiRoutes.problems.update(id),
            problemData
        );
        return response.data;
    },
};

export default problemService;
