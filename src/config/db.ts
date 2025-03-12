import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb+srv://longtl446:KbicJbOjAw8HHmSw@jobbuilderbd.wmm8s.mongodb.net/?retryWrites=true&w=majority&appName=jobBuilderBd";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};
