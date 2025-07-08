import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/authService";

// Async thunks
export const initializeAuth = createAsyncThunk(
    "user/initializeAuth",
    async () => {
        try {
            const response = await authService.getUser();
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch (error) {
            return null; // Not an error, just not authenticated
        }
    }
);

export const loginUser = createAsyncThunk(
    "user/loginUser",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await authService.login(email, password);
            if (response.success) {
                return response.data;
            }
            return rejectWithValue(response.message);
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || "Login failed"
            );
        }
    }
);

export const logoutUser = createAsyncThunk("user/logoutUser", async () => {
    try {
        await authService.logout();
        return null;
    } catch (error) {
        // Even if API call fails, we still want to clear local state
        return null;
    }
});

const initialState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    isInitializing: true, // Track initial auth check
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            state.error = null;
            state.isInitializing = false;
        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
            state.isInitializing = false;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            state.loading = false;
        },
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isInitializing = false;
        },
        initializeComplete: (state) => {
            state.isInitializing = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // Initialize auth
            .addCase(initializeAuth.pending, (state) => {
                state.isInitializing = true;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isInitializing = false;
                if (action.payload) {
                    state.isAuthenticated = true;
                    state.user = action.payload;
                } else {
                    state.isAuthenticated = false;
                    state.user = null;
                }
            })
            .addCase(initializeAuth.rejected, (state) => {
                state.isInitializing = false;
                state.isAuthenticated = false;
                state.user = null;
            })
            // Login user
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
                state.error = null;
                state.isInitializing = false;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = action.payload;
                state.isInitializing = false;
            })
            // Logout user
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.error = null;
            });
    },
});

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    clearError,
    setUser,
    initializeComplete,
} = userSlice.actions;

export default userSlice.reducer;
