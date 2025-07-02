import axios, { compilerAxios } from "../utils/axios";
import ApiRoutes from "../routes/routes";

const problemService = {
    createProblem: async (problemData) => {
        const response = await axios.post(
            ApiRoutes.problems.create,
            problemData
        );
        return response.data;
    },

    getAllProblems: async () => {
        const response = await axios.get(ApiRoutes.problems.getAll);
        return response.data;
    },

    getProblemById: async (id) => {
        const response = await axios.get(ApiRoutes.problems.getById(id));
        return response.data;
    },

    updateProblem: async (id, problemData) => {
        const response = await axios.put(
            ApiRoutes.problems.update(id),
            problemData
        );
        return response.data;
    },

    executeCode: async (code, language, input = "") => {
        const response = await compilerAxios.post(ApiRoutes.problems.execute, {
            code,
            language,
            input,
        });
        return response.data;
    },
};

export default problemService;
