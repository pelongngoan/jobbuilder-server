import express from "express";
import { router } from "./routes";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

dotenv.config();
const app = express();
const port = 3000;

app.use(express.json());

app.use(router); // Register router with app

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// Connect to MongoDB
connectDB();

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
