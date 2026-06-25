import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 8000,
});

export async function fetchDatabaseSchema() {
  const response = await api.get("/schema");
  return response.data;
}

export async function fetchFormattedSchema() {
  const response = await api.get("/schema/formatted");
  return response.data;
}

export async function fetchTables() {
  const response = await api.get("/schema/tables");
  return response.data;
}

export async function fetchTable(tableName) {
  const response = await api.get(`/schema/table/${encodeURIComponent(tableName)}`);
  return response.data;
}
