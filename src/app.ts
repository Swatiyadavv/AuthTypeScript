import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.route";

const app: Application = express();

app.use(cors());
app.use(express.json());

// health
app.get("/", (req, res) => res.json({ success: true, message: "Admin Auth API" }));

app.use("/api/auth", authRoutes);

// global 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

export default app;
