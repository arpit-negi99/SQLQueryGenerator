import pool from "../config/db.js";
import { buildCountQuery } from "../utils/countQueryBuilder.js";

function readEstimatedRows(rows) {
  const value = rows?.[0]?.estimatedRows ?? rows?.[0]?.["COUNT(*)"] ?? 0;
  return Number(value) || 0;
}

function buildDescription(queryType, estimatedRows) {
  if (queryType === "SELECT") {
    return `This query may return approximately ${estimatedRows} rows.`;
  }

  if (queryType === "INSERT") {
    return "This query may insert approximately 1 row.";
  }

  return `This query may modify approximately ${estimatedRows} rows.`;
}

export async function analyzeImpact({ sql, statement, queryType }) {
  if (queryType === "INSERT") {
    return {
      type: "WRITE",
      estimatedRows: 1,
      description: buildDescription(queryType, 1),
    };
  }

  const countQuery = buildCountQuery({ sql, statement, queryType });

  if (!countQuery) {
    return {
      type: queryType === "SELECT" ? "READ" : "WRITE",
      estimatedRows: null,
      description: "The impact could not be estimated automatically.",
    };
  }

  try {
    const [rows] = await pool.execute(countQuery);
    const estimatedRows = readEstimatedRows(rows);

    return {
      type: queryType === "SELECT" ? "READ" : "WRITE",
      estimatedRows,
      description: buildDescription(queryType, estimatedRows),
    };
  } catch {
    return {
      type: queryType === "SELECT" ? "READ" : "WRITE",
      estimatedRows: null,
      description: "The impact preview query could not be completed safely.",
    };
  }
}
