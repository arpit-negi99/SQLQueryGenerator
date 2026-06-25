import { generateSqlQueries } from "../services/queryGenerator.service.js";

export async function generateQuery(req, res, next) {
  try {
    const result = await generateSqlQueries(req.body?.prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
