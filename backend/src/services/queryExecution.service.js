import pool from "../config/db.js";
import { parseSql } from "../utils/sqlParser.js";
import { validateQueryImpact } from "./validation.service.js";

function buildExecutionError(message, validation = null) {
  const error = new Error(message);
  error.statusCode = 400;
  error.validation = validation;
  return error;
}

function readWriteSummary(result) {
  return {
    affectedRows: result?.affectedRows ?? 0,
    changedRows: result?.changedRows ?? 0,
    insertedId: result?.insertId || null,
    warningStatus: result?.warningStatus ?? 0,
  };
}

export async function executeSqlQuery({ sql }) {
  const { normalizedSql } = parseSql(sql);
  const validation = await validateQueryImpact({ sql: normalizedSql });

  if (!validation.valid || !validation.safe || validation.blocked) {
    throw buildExecutionError(
      validation.message || "This query cannot be executed safely.",
      validation
    );
  }

  const [rows] = await pool.execute(normalizedSql);

  if (validation.queryType === "SELECT") {
    const rowCount = rows.length;

    return {
      success: true,
      queryType: validation.queryType,
      message: `Query executed successfully. Returned ${rowCount} row${rowCount === 1 ? "" : "s"}.`,
      rows: [],
      columns: [],
      rowCount,
      validation,
    };
  }

  const summary = readWriteSummary(rows);

  return {
    success: true,
    queryType: validation.queryType,
    message: `Query executed successfully. ${summary.affectedRows} row${summary.affectedRows === 1 ? "" : "s"} affected.`,
    rows: [],
    columns: [],
    rowCount: 0,
    ...summary,
    validation,
  };
}
