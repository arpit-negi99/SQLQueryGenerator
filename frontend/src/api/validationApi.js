import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

export async function validateQueryImpact({ sql, queryType }) {
  const response = await api.post("/query/validate-impact", { sql, queryType });
  return response.data;
}
