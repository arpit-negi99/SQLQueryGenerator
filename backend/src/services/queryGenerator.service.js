import { getFormattedSchema } from "./schema.service.js";
import { generateAiResponse } from "./ai.service.js";
import { buildSqlGenerationPrompt } from "../prompts/sqlGenerationPrompt.js";
import { parseAiJson } from "../utils/cleanAiResponse.js";
import { checkSqlSafety } from "../utils/sqlSafetyChecker.js";

const validQueryTypes = ["SELECT", "INSERT", "UPDATE", "DELETE", "UNKNOWN"];
const validConfidenceLevels = ["high", "medium", "low"];
const validRiskLevels = ["low", "medium", "high", "blocked"];

function normalizeArray(value) {
  return Array.isArray(value) ? value.map(String) : [];
}

function normalizeQuery(query, index) {
  const sql = String(query.sql || "").trim();
  const queryType = String(query.queryType || "UNKNOWN").toUpperCase();
  const confidence = String(query.confidence || "low").toLowerCase();
  const riskLevel = String(query.riskLevel || "medium").toLowerCase();
  const safetyResult = checkSqlSafety(sql);

  if (!safetyResult.safe) {
    return {
      id: index + 1,
      sql,
      explanation: safetyResult.reason,
      queryType: validQueryTypes.includes(queryType) ? queryType : "UNKNOWN",
      tablesUsed: normalizeArray(query.tablesUsed),
      columnsUsed: normalizeArray(query.columnsUsed),
      confidence: "low",
      riskLevel: "blocked",
      requiresConfirmation: true,
    };
  }

  return {
    id: index + 1,
    sql,
    explanation: String(query.explanation || "No explanation provided."),
    queryType: validQueryTypes.includes(queryType) ? queryType : "UNKNOWN",
    tablesUsed: normalizeArray(query.tablesUsed),
    columnsUsed: normalizeArray(query.columnsUsed),
    confidence: validConfidenceLevels.includes(confidence) ? confidence : "low",
    riskLevel: validRiskLevels.includes(riskLevel) ? riskLevel : "medium",
    requiresConfirmation:
      ["INSERT", "UPDATE", "DELETE"].includes(queryType) ||
      Boolean(query.requiresConfirmation),
  };
}

function normalizeAiPayload(payload) {
  if (!payload || !Array.isArray(payload.queries)) {
    const error = new Error("AI response did not include a queries array.");
    error.statusCode = 502;
    throw error;
  }

  return payload.queries.map(normalizeQuery);
}

export async function generateSqlQueries(userPrompt) {
  const trimmedPrompt = String(userPrompt || "").trim();

  if (!trimmedPrompt) {
    const error = new Error("Please enter a query request first.");
    error.statusCode = 400;
    throw error;
  }

  const schema = await getFormattedSchema();

  if (!schema || schema.includes("No tables found.")) {
    const error = new Error("No database schema found. Add tables first.");
    error.statusCode = 400;
    throw error;
  }

  const aiPrompt = buildSqlGenerationPrompt({
    schema,
    userPrompt: trimmedPrompt,
  });

  const aiResponse = await generateAiResponse(aiPrompt);
  const parsedResponse = parseAiJson(aiResponse);
  const queries = normalizeAiPayload(parsedResponse);

  return {
    success: true,
    userPrompt: trimmedPrompt,
    queries,
  };
}
