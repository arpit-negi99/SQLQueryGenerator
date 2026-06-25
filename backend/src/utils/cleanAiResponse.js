export function cleanAiResponse(aiResponse) {
  if (!aiResponse || typeof aiResponse !== "string") {
    const error = new Error("AI returned an empty response.");
    error.statusCode = 502;
    throw error;
  }

  return aiResponse
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export function parseAiJson(aiResponse) {
  const cleanedResponse = cleanAiResponse(aiResponse);

  try {
    return JSON.parse(cleanedResponse);
  } catch (error) {
    const parseError = new Error("AI returned invalid JSON. Please try again.");
    parseError.statusCode = 502;
    throw parseError;
  }
}
