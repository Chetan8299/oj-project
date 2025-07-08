import ApiRoutes from "../routes/routes";
import axios from "../utils/axios";

const reviewCode = async (code, language) => {
    const response = await axios.post(ApiRoutes.ai.reviewCode, {
        code,
        language,
    });
    console.log(response.data);
    return response.data;
};

export default {
    reviewCode,
};
