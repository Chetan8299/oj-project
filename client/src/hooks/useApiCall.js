import { useState, useCallback } from "react";

const useApiCall = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const execute = useCallback(async (apiFunction, onSuccess, onError) => {
        setLoading(true);
        setError("");

        try {
            const response = await apiFunction();
            if (onSuccess) {
                onSuccess(response);
            }
            return response;
        } catch (err) {
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                "An error occurred";
            setError(errorMessage);
            if (onError) {
                onError(err);
            }
            throw err;
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array since the function doesn't depend on any props or state

    const clearError = () => setError("");

    return {
        loading,
        error,
        execute,
        clearError,
        setError,
    };
};

export default useApiCall;
