export function buildSqlGenerationPrompt({ schema, userPrompt }) {
  return `You are an expert SQL query generator.

Your task is to convert natural language user requests into valid MySQL SQL queries.

Use only the database schema provided below.

Database Schema:
${schema}

User Request:
${userPrompt}

Rules:

1. Generate only MySQL-compatible SQL.
2. Use only tables and columns present in the schema.
3. Do not invent table names or column names.
4. If the user request is ambiguous, generate multiple possible query options.
5. For SELECT queries, generate safe readable queries.
6. For UPDATE and DELETE queries, always include a WHERE clause when the user request can be made safe.
7. If the user asks for unsafe SQL such as DROP, TRUNCATE, ALTER, CREATE DATABASE, GRANT, REVOKE, multiple SQL statements, DELETE without WHERE, or UPDATE without WHERE, still return the SQL that represents the user's request so it can be reviewed in the frontend.
8. Unsafe SQL must be marked with riskLevel "blocked", confidence "low", and requiresConfirmation true. It is shown for review only and must not be executed.
9. Use proper table relationships if joins are required.
10. Prefer explicit column names over SELECT * when possible.
11. Return JSON only.

Output JSON format:

{
  "queries": [
    {
      "sql": "",
      "explanation": "",
      "queryType": "",
      "tablesUsed": [],
      "columnsUsed": [],
      "confidence": "",
      "riskLevel": "",
      "requiresConfirmation": false,
      "canExecute": true
    }
  ]
}

For queryType, use one of:
SELECT, INSERT, UPDATE, DELETE, DROP, TRUNCATE, ALTER, CREATE, GRANT, REVOKE, UNKNOWN

For confidence, use:
high, medium, low

For riskLevel, use:
low, medium, high, blocked

For requiresConfirmation:
false for SELECT
true for INSERT, UPDATE, DELETE

For canExecute:
true only when the query is safe enough to be validated and executed by the backend
false for every blocked query

If the request is dangerous or cannot be made safe, return the generated SQL for display only:

{
  "queries": [
    {
      "sql": "DROP TABLE example_table;",
      "explanation": "This request was blocked because it may damage the database. The SQL is shown for review only and must not be executed.",
      "queryType": "DROP",
      "tablesUsed": [],
      "columnsUsed": [],
      "confidence": "low",
      "riskLevel": "blocked",
      "requiresConfirmation": true,
      "canExecute": false
    }
  ]
}`;
}
