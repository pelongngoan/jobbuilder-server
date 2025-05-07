import express from "express";
import router from "./routes";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import cors from "cors";
import path from "path";
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

app.use(router);

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
