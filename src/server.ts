import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/db";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

import userRoutes from "./routes/user.routes";
import accountRoutes from "./routes/account.routes";

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/account", accountRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
