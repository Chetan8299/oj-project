/**
 * Verdict utilities for displaying submission results
 */

export const getVerdictColor = (verdict) => {
    switch (verdict) {
        case "Accepted":
            return "text-green-600 bg-green-50 border-green-200";
        case "Wrong Answer":
            return "text-red-600 bg-red-50 border-red-200";
        case "Time Limit Exceeded":
            return "text-orange-600 bg-orange-50 border-orange-200";
        case "Memory Limit Exceeded":
            return "text-purple-600 bg-purple-50 border-purple-200";
        case "Runtime Error":
            return "text-yellow-600 bg-yellow-50 border-yellow-200";
        case "Compilation Error":
            return "text-gray-600 bg-gray-50 border-gray-200";
        case "Constraint Violation":
            return "text-pink-600 bg-pink-50 border-pink-200";
        default:
            return "text-gray-600 bg-gray-50 border-gray-200";
    }
};

export const getVerdictIcon = (verdict) => {
    switch (verdict) {
        case "Accepted":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Wrong Answer":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm4.707-10.293a1 1 0 00-1.414-1.414L9 10.586 5.707 7.293a1 1 0 00-1.414 1.414L8.586 12l-4.293 4.293a1 1 0 101.414 1.414L9 13.414l4.293 4.293a1 1 0 001.414-1.414L10.414 12l4.293-4.293z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Time Limit Exceeded":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Memory Limit Exceeded":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Runtime Error":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Compilation Error":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        case "Constraint Violation":
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                        clipRule="evenodd"
                    />
                </svg>
            );
        default:
            return (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                    />
                </svg>
            );
    }
};

export const getVerdictDescription = (verdict) => {
    switch (verdict) {
        case "Accepted":
            return "Your solution is correct and passed all test cases!";
        case "Wrong Answer":
            return "Your solution produced incorrect output for one or more test cases.";
        case "Time Limit Exceeded":
            return "Your solution took too long to execute. Try optimizing your algorithm.";
        case "Memory Limit Exceeded":
            return "Your solution used too much memory. Try reducing memory usage.";
        case "Runtime Error":
            return "Your solution crashed during execution. Check for array bounds, null pointers, etc.";
        case "Compilation Error":
            return "Your code could not be compiled. Check for syntax errors.";
        case "Constraint Violation":
            return "The input data violates the problem constraints.";
        default:
            return "Unknown verdict. Please try again.";
    }
};

export const formatConstraints = (constraints) => {
    if (!constraints) return null;

    const items = [];

    if (constraints.timeLimit) {
        items.push(`Time: ${constraints.timeLimit}ms`);
    }

    if (constraints.memoryLimit) {
        items.push(`Memory: ${constraints.memoryLimit}MB`);
    }

    if (
        constraints.inputConstraints &&
        constraints.inputConstraints.length > 0
    ) {
        constraints.inputConstraints.forEach((constraint) => {
            if (constraint.min !== null && constraint.max !== null) {
                items.push(
                    `${constraint.min} ≤ ${constraint.variable} ≤ ${constraint.max}`
                );
            } else if (constraint.max !== null) {
                items.push(`${constraint.variable} ≤ ${constraint.max}`);
            } else if (constraint.min !== null) {
                items.push(`${constraint.min} ≤ ${constraint.variable}`);
            }
        });
    }

    return items;
};
