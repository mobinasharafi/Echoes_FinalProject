import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// quick health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Echoes API is running" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Echoes API listening on port ${PORT}`);
});