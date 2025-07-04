import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
    Home,
    Login,
    Signup,
    Profile,
    CreateProblem,
    Problems,
    Problem,
} from "./pages";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/create-problem" element={<CreateProblem />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:id" element={<Problem />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
