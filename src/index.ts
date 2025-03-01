import express from "express";
import { router } from "./routes";

const app = express();
const port = 3000;

app.use(express.json());

app.use(router); // Register router with app

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
