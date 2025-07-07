import { compilerAxios } from "../utils/axios";
import ApiRoutes from "../routes/routes";

export const executeCode = async (code, language, input) => {
    const response = await compilerAxios.post(ApiRoutes.compiler.execute, {
        code,
        language,
        input,
    });
    console.log(response.data);
    return response.data;
};

export const executeTestCases = async (code, language, testCases) => {
    const response = await compilerAxios.post(ApiRoutes.compiler.executeTests, {
        code,
        language,
        testCases,
    });
    return response.data;
};

export const getSupportedLanguages = async () => {
    const response = await compilerAxios.get(ApiRoutes.compiler.languages);
    return response.data;
};
