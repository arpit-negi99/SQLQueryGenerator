import { getCompleteSchema } from "./schema.service.js";
import { analyzeImpact } from "./impactAnalyzer.service.js";
import { validateSqlAgainstSchema } from "./schemaValidation.service.js";
import { parseSql } from "../utils/sqlParser.js";
import { analyzeSqlRisk } from "../utils/sqlRiskAnalyzer.js";

function blockedResponse({ queryType = "UNKNOWN", message, warnings = [] }) {
  return {
    success: true,
    valid: false,
    safe: false,
    blocked: true,
    queryType,
    riskLevel: "blocked",
    message,
    tablesUsed: [],
    columnsUsed: [],
    impact: null,
    warnings,
  };
}

export async function validateQueryImpact({ sql }) {
  const { statements, normalizedSql } = parseSql(sql);
  const initialRisk = analyzeSqlRisk({ sql: normalizedSql, statements });

  if (initialRisk.blocked) {
    return blockedResponse(initialRisk);
  }

  const schema = await getCompleteSchema();
  const schemaValidation = validateSqlAgainstSchema({ schema, statements });

  if (!schemaValidation.valid) {
    return {
      ...blockedResponse({
        queryType: initialRisk.queryType,
        message: "The query uses a table or column that does not exist in the database schema.",
        warnings: [
          ...schemaValidation.missingTables.map((table) => `Unknown table: ${table}`),
          ...schemaValidation.missingColumns.map((column) => `Unknown column: ${column}`),
        ],
      }),
      tablesUsed: schemaValidation.tablesUsed,
      columnsUsed: schemaValidation.columnsUsed,
    };
  }

  const statement = statements[0];
  const impact = await analyzeImpact({
    sql: normalizedSql,
    statement,
    queryType: initialRisk.queryType,
  });
  const finalRisk = analyzeSqlRisk({
    sql: normalizedSql,
    statements,
    estimatedRows: impact.estimatedRows,
  });

  return {
    success: true,
    valid: true,
    safe: finalRisk.safe,
    blocked: finalRisk.blocked,
    queryType: finalRisk.queryType,
    riskLevel: finalRisk.riskLevel,
    message: finalRisk.message,
    tablesUsed: schemaValidation.tablesUsed,
    columnsUsed: schemaValidation.columnsUsed,
    impact,
    warnings: finalRisk.warnings,
  };
}
