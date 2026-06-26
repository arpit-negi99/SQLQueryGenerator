const destructivePatterns = [
  { pattern: /\bDROP\s+DATABASE\b/i, operation: "DROP", message: "DROP DATABASE operations are not allowed." },
  { pattern: /\bDROP\s+TABLE\b/i, operation: "DROP", message: "DROP TABLE operations are not allowed." },
  { pattern: /\bTRUNCATE\b/i, operation: "TRUNCATE", message: "TRUNCATE operations are not allowed." },
  { pattern: /\bALTER\s+TABLE\b/i, operation: "ALTER", message: "ALTER TABLE operations are not allowed." },
  { pattern: /\bCREATE\s+DATABASE\b/i, operation: "CREATE", message: "CREATE DATABASE operations are not allowed." },
  { pattern: /\bCREATE\s+TABLE\b/i, operation: "CREATE", message: "CREATE TABLE operations are not allowed." },
  { pattern: /\bRENAME\s+TABLE\b/i, operation: "RENAME", message: "RENAME TABLE operations are not allowed." },
  { pattern: /\bGRANT\b/i, operation: "GRANT", message: "GRANT operations are not allowed." },
  { pattern: /\bREVOKE\b/i, operation: "REVOKE", message: "REVOKE operations are not allowed." },
  { pattern: /\bLOCK\s+TABLES\b/i, operation: "LOCK", message: "LOCK TABLES operations are not allowed." },
  { pattern: /\bUNLOCK\s+TABLES\b/i, operation: "UNLOCK", message: "UNLOCK TABLES operations are not allowed." },
  { pattern: /\bCALL\b/i, operation: "CALL", message: "Stored procedure calls are not allowed." },
];

function hasRawComments(sql) {
  return /--|#|\/\*/.test(sql);
}

function hasMultipleStatements(sql) {
  const statements = sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  return statements.length > 1;
}

function getAstType(statement) {
  return String(statement?.type || "UNKNOWN").toUpperCase();
}

function hasWhere(statement) {
  return Boolean(statement?.where);
}

function hasLimit(statement) {
  return Boolean(statement?.limit);
}

function isSelectAll(statement) {
  return (statement?.columns || []).some((column) => {
    if (column?.expr?.type === "column_ref") {
      return column.expr.column === "*";
    }

    return column?.expr?.type === "star";
  });
}

function isAggregation(statement) {
  return (statement?.columns || []).some((column) => {
    const expression = column?.expr;
    return expression?.type === "aggr_func" || expression?.type === "function";
  });
}

export function analyzeSqlRisk({ sql, statements, estimatedRows = null }) {
  const warnings = [];

  if (hasRawComments(sql)) {
    return {
      safe: false,
      blocked: true,
      riskLevel: "blocked",
      queryType: "UNKNOWN",
      message: "This query is blocked because raw SQL comments are not allowed in generated queries.",
      warnings: ["Suspicious SQL comments detected."],
    };
  }

  if (hasMultipleStatements(sql) || statements.length > 1) {
    return {
      safe: false,
      blocked: true,
      riskLevel: "blocked",
      queryType: "UNKNOWN",
      message: "This query is blocked because multiple SQL statements are not allowed.",
      warnings: ["Multiple SQL statements detected."],
    };
  }

  for (const blockedPattern of destructivePatterns) {
    if (blockedPattern.pattern.test(sql)) {
      return {
        safe: false,
        blocked: true,
        riskLevel: "blocked",
        queryType: blockedPattern.operation,
        message: `This query is blocked because ${blockedPattern.operation} operations are not allowed.`,
        warnings: ["Dangerous database operation detected."],
      };
    }
  }

  const statement = statements[0];
  const queryType = getAstType(statement);

  if (!["SELECT", "INSERT", "UPDATE", "DELETE"].includes(queryType)) {
    return {
      safe: false,
      blocked: true,
      riskLevel: "blocked",
      queryType,
      message: "This SQL operation is not supported for validation and preview.",
      warnings: ["Unsupported SQL operation detected."],
    };
  }

  if (queryType === "UPDATE" && !hasWhere(statement)) {
    return {
      safe: false,
      blocked: true,
      riskLevel: "blocked",
      queryType,
      message: "This query is blocked because UPDATE statements must include a WHERE clause.",
      warnings: ["UPDATE without WHERE can modify every row in a table."],
    };
  }

  if (queryType === "DELETE" && !hasWhere(statement)) {
    return {
      safe: false,
      blocked: true,
      riskLevel: "blocked",
      queryType,
      message: "This query is blocked because DELETE statements must include a WHERE clause.",
      warnings: ["DELETE without WHERE can remove every row in a table."],
    };
  }

  if (queryType === "INSERT") {
    return {
      safe: true,
      blocked: false,
      riskLevel: "medium",
      queryType,
      message: "Query is valid but requires confirmation before execution.",
      warnings: ["This query inserts data.", "User confirmation is required before execution."],
    };
  }

  if (["UPDATE", "DELETE"].includes(queryType)) {
    warnings.push("This query modifies data.");
    warnings.push("User confirmation is required before execution.");

    return {
      safe: true,
      blocked: false,
      riskLevel: estimatedRows !== null && estimatedRows > 500 ? "high" : "medium",
      queryType,
      message: "Query is valid but requires confirmation before execution.",
      warnings,
    };
  }

  if (queryType === "SELECT") {
    const broadSelect = !hasWhere(statement) && !hasLimit(statement) && !isAggregation(statement);
    const broadSelectAll = isSelectAll(statement) && !hasLimit(statement);

    if (broadSelect) {
      warnings.push("This SELECT query does not include a WHERE or LIMIT clause.");
    }

    if (broadSelectAll) {
      warnings.push("SELECT * without LIMIT may return more data than expected.");
    }

    const highRisk = broadSelectAll || broadSelect || (estimatedRows !== null && estimatedRows > 1000);

    return {
      safe: true,
      blocked: false,
      riskLevel: highRisk ? "high" : "low",
      queryType,
      message: highRisk
        ? "Query is valid, but review the impact before execution."
        : "Query is valid and safe.",
      warnings,
    };
  }

  return {
    safe: true,
    blocked: false,
    riskLevel: "low",
    queryType,
    message: "Query is valid and safe.",
    warnings,
  };
}
