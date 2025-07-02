import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const compilerURL =
    import.meta.env.VITE_COMPILER_URL || "http://localhost:3001";

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
});

export const compilerAxios = axios.create({
    baseURL: compilerURL,
    withCredentials: true,
});

export default axiosInstance;
