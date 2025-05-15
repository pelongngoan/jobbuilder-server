import express from "express";
import router from "./routes";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middleware/errorMiddleware";
// Import all models to ensure they are registered
import "./database/models";

dotenv.config();

const app = express();
const port = process.env.PORT;

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173", // your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["set-cookie"],
};

app.use(express.json());
app.use(cors(corsOptions));

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Create uploads directory if it doesn't exist
import fs from "fs";
if (!fs.existsSync(path.join(process.cwd(), "uploads"))) {
  fs.mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });
}

app.use(router);

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
