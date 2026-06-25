const blockedPatterns = [
  {
    pattern: /\bDROP\b/i,
    reason: "DROP statements are not allowed.",
  },
  {
    pattern: /\bTRUNCATE\b/i,
    reason: "TRUNCATE statements are not allowed.",
  },
  {
    pattern: /\bALTER\b/i,
    reason: "ALTER statements are not allowed.",
  },
  {
    pattern: /\bCREATE\s+DATABASE\b/i,
    reason: "CREATE DATABASE statements are not allowed.",
  },
];

function normalizeSql(sql) {
  return String(sql || "")
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .trim();
}

export function checkSqlSafety(sql) {
  const normalizedSql = normalizeSql(sql);

  if (!normalizedSql) {
    return {
      safe: true,
      reason: "",
    };
  }

  for (const blockedPattern of blockedPatterns) {
    if (blockedPattern.pattern.test(normalizedSql)) {
      return {
        safe: false,
        reason: blockedPattern.reason,
      };
    }
  }

  if (/\bDELETE\b/i.test(normalizedSql) && !/\bWHERE\b/i.test(normalizedSql)) {
    return {
      safe: false,
      reason: "DELETE query must contain WHERE clause.",
    };
  }

  if (/\bUPDATE\b/i.test(normalizedSql) && !/\bWHERE\b/i.test(normalizedSql)) {
    return {
      safe: false,
      reason: "UPDATE query must contain WHERE clause.",
    };
  }

  return {
    safe: true,
    reason: "",
  };
}
