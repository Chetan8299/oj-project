import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import compilerRoutes from "./routes/compiler.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Routes
app.use("/api/v1/compiler", compilerRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Compiler service is running",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Compiler service running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
