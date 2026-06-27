import { executeSqlQuery } from "../services/queryExecution.service.js";

export async function executeQuery(req, res, next) {
  try {
    const result = await executeSqlQuery({ sql: req.body?.sql });
    res.json(result);
  } catch (error) {
    if (error.statusCode === 400) {
      res.status(400).json({
        success: false,
        message: error.message,
        validation: error.validation || null,
      });
      return;
    }

    next(error);
  }
}
