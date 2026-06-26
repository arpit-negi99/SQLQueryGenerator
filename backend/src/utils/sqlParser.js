import sqlParser from "node-sql-parser";

const { Parser } = sqlParser;

const parser = new Parser();
const parserOptions = { database: "MySQL" };

export function normalizeSql(sql) {
  return String(sql || "").trim();
}

export function parseSql(sql) {
  const normalizedSql = normalizeSql(sql);

  if (!normalizedSql) {
    const error = new Error("Please provide a SQL query to validate.");
    error.statusCode = 400;
    throw error;
  }

  try {
    const ast = parser.astify(normalizedSql, parserOptions);
    return {
      ast,
      statements: Array.isArray(ast) ? ast : [ast],
      normalizedSql,
    };
  } catch {
    const error = new Error("The SQL syntax is invalid. Please regenerate or edit the query.");
    error.statusCode = 400;
    error.code = "INVALID_SQL_SYNTAX";
    throw error;
  }
}

export function sqlify(ast) {
  return parser.sqlify(ast, parserOptions);
}
