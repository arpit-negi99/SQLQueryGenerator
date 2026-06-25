const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

function getProvider() {
  if (process.env.AI_PROVIDER) {
    return process.env.AI_PROVIDER.toLowerCase();
  }

  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";

  return "";
}

function createAiError(message, statusCode = 502) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function readProviderError(response, providerName) {
  try {
    const data = await response.json();
    const providerMessage = data.error?.message;

    if (providerMessage) {
      return `${providerName} API error: ${providerMessage}`;
    }
  } catch (error) {
    // Keep the public error friendly if the provider returns non-JSON text.
  }

  return `${providerName} API request failed with status ${response.status}.`;
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw createAiError("Gemini API key is missing.", 500);
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    throw createAiError(await readProviderError(response, "Gemini"));
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw createAiError("Gemini returned an empty response.");
  }

  return text;
}

async function callOpenAI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw createAiError("OpenAI API key is missing.", 500);
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You return valid JSON only. Do not include markdown or prose outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw createAiError(await readProviderError(response, "OpenAI"));
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw createAiError("OpenAI returned an empty response.");
  }

  return text;
}

async function callOpenRouter(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw createAiError("OpenRouter API key is missing.", 500);
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:5174",
      "X-Title": process.env.OPENROUTER_APP_NAME || "AI SQL Query Generator",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 1200,
      messages: [
        {
          role: "system",
          content:
            "Return valid JSON only. Do not include markdown, code fences, or prose outside JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw createAiError(await readProviderError(response, "OpenRouter"));
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw createAiError("OpenRouter returned an empty response.");
  }

  return text;
}

export async function generateAiResponse(prompt) {
  const provider = getProvider();

  if (provider === "gemini") {
    return callGemini(prompt);
  }

  if (provider === "openai") {
    return callOpenAI(prompt);
  }

  if (provider === "openrouter") {
    return callOpenRouter(prompt);
  }

  throw createAiError(
    "AI API key is missing. Add GEMINI_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY in backend .env.",
    500
  );
}
