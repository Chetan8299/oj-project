import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Home,
    Login,
    Signup,
    Profile,
    CreateProblem,
    EditProblem,
    Problems,
    MyProblems,
    AdminUsers,
    Problem,
} from "./pages";
import { initializeAuth } from "./store/slices/userSlice";

const App = () => {
    const dispatch = useDispatch();
    const { isInitializing } = useSelector((state) => state.user);

    useEffect(() => {
        dispatch(initializeAuth());
    }, [dispatch]);

    // Show loading screen while checking authentication
    if (isInitializing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-problem" element={<CreateProblem />} />
                <Route path="/edit-problem/:id" element={<EditProblem />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/my-problems" element={<MyProblems />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/problems/:id" element={<Problem />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
