import express from "express";
import cookieParser from "cookie-parser";
import setupCors from "./config/cors.js";

import userRoutes from "./routes/auth.routes.js";
import paymentRoutes from "./routes/payments.routes.js";

const app = express();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS (env-based)
setupCors(app);

// routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/payment", paymentRoutes);

// global error handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

export default app;
