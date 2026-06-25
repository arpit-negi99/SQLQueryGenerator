import dotenv from "dotenv";
import app from "./app.js";
import { testDatabaseConnection } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  await testDatabaseConnection();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}

startServer();
