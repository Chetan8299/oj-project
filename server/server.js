import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/index.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Import Routes
import userRoutes from "./routes/user.routes.js";
import problemRoutes from "./routes/problem.routes.js";

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/problems", problemRoutes);

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB", error);
    });
