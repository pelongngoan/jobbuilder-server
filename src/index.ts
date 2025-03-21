import express from "express";
import { router } from "./routes";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(router);

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
