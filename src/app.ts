import express, { Application } from "express";
import cors from "cors";
import authRoutes from "../src/routes/admin.route";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // ✅ add this line

app.get("/", (req, res) => res.json({ success: true, message: "Admin Auth API" }));

app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
