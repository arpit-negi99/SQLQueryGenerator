import { validateQueryImpact } from "../services/validation.service.js";

export async function validateImpact(req, res, next) {
  try {
    const result = await validateQueryImpact({
      sql: req.body?.sql,
      queryType: req.body?.queryType,
    });

    res.json(result);
  } catch (error) {
    if (error.code === "INVALID_SQL_SYNTAX") {
      res.status(400).json({
        success: true,
        valid: false,
        safe: false,
        blocked: true,
        queryType: "UNKNOWN",
        riskLevel: "blocked",
        message: error.message,
        tablesUsed: [],
        columnsUsed: [],
        impact: null,
        warnings: ["Invalid SQL syntax."],
      });
      return;
    }

    if (error.statusCode === 400) {
      res.status(400).json({
        success: false,
        valid: false,
        safe: false,
        blocked: true,
        queryType: "UNKNOWN",
        riskLevel: "blocked",
        message: error.message,
        tablesUsed: [],
        columnsUsed: [],
        impact: null,
        warnings: [],
      });
      return;
    }

    next(error);
  }
}
