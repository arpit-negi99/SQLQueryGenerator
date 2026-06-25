import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import schemaRoutes from "./routes/schema.routes.js";
import queryRoutes from "./routes/query.routes.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://127.0.0.1:5174",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI SQL Query Generator backend is running.",
  });
});

app.use("/api/schema", schemaRoutes);
app.use("/api/query", queryRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
