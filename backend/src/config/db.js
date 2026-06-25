import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const requiredEnvValues = ["DB_HOST", "DB_USER", "DB_NAME"];

for (const key of requiredEnvValues) {
  if (!process.env[key]) {
    console.warn(`Missing required environment variable: ${key}`);
  }
}

export const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

export async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log("Database connection successful.");
    return true;
  } catch (error) {
    console.error("Unable to connect to MySQL. Check your credentials.");
    return false;
  }
}

export default pool;
