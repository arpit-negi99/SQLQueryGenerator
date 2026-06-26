import { sqlify } from "./sqlParser.js";

function stripTrailingSemicolon(sql) {
  return String(sql || "").trim().replace(/;+\s*$/, "");
}

function stripSelectTail(sql) {
  return sql
    .replace(/\s+ORDER\s+BY\s+[\s\S]*$/i, "")
    .replace(/\s+LIMIT\s+[\s\S]*$/i, "")
    .replace(/\s+OFFSET\s+[\s\S]*$/i, "");
}

function buildSelectCountQuery(sql) {
  const cleanSql = stripSelectTail(stripTrailingSemicolon(sql));
  const fromIndex = cleanSql.search(/\bFROM\b/i);

  if (fromIndex === -1) {
    return null;
  }

  return `SELECT COUNT(*) AS estimatedRows ${cleanSql.slice(fromIndex)}`;
}

function tableToSql(table) {
  if (!table) {
    return "";
  }

  if (typeof table === "string") {
    return table;
  }

  if (table.table) {
    return table.db ? `\`${table.db}\`.\`${table.table}\`` : `\`${table.table}\``;
  }

  return "";
}

function buildWhereSql(statement) {
  if (!statement?.where) {
    return "";
  }

  return sqlify({
    type: "select",
    columns: [{ expr: { type: "number", value: 1 }, as: null }],
    from: [{ table: "__preview_source__", as: null }],
    where: statement.where,
  }).replace(/^SELECT 1 FROM `?__preview_source__`?\s+WHERE\s+/i, "");
}

function buildUpdateCountQuery(statement) {
  const table = Array.isArray(statement.table) ? statement.table[0] : statement.table;
  const tableSql = tableToSql(table);
  const whereSql = buildWhereSql(statement);

  if (!tableSql || !whereSql) {
    return null;
  }

  return `SELECT COUNT(*) AS estimatedRows FROM ${tableSql} WHERE ${whereSql}`;
}

function buildDeleteCountQuery(statement) {
  const table = Array.isArray(statement.from) ? statement.from[0] : statement.from;
  const tableSql = tableToSql(table);
  const whereSql = buildWhereSql(statement);

  if (!tableSql || !whereSql) {
    return null;
  }

  return `SELECT COUNT(*) AS estimatedRows FROM ${tableSql} WHERE ${whereSql}`;
}

export function buildCountQuery({ sql, statement, queryType }) {
  if (queryType === "SELECT") {
    return buildSelectCountQuery(sql);
  }

  if (queryType === "UPDATE") {
    return buildUpdateCountQuery(statement);
  }

  if (queryType === "DELETE") {
    return buildDeleteCountQuery(statement);
  }

  return null;
}
