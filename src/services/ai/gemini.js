// src/services/ai/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Intention } = require("../../prompts");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usamos un modelo rápido y barato para clasificación/ extracción
const model = () => genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Campos mínimos para crear un evento
const REQUIRED_CREATE_FIELDS = ["title", "date", "startTime", "endTime"];

function resolveRelativeDate(params) {
  const now = new Date(); // aquí está tu "hoy" real
  let target = null;

  if (params.relativeDay === "today") {
    target = now;
  } else if (params.relativeDay === "tomorrow") {
    target = new Date(now);
    target.setDate(now.getDate() + 1);
  } else if (params.relativeDay === "day_after_tomorrow") {
    target = new Date(now);
    target.setDate(now.getDate() + 2);
  } else if (typeof params.daysFromToday === "number") {
    target = new Date(now);
    target.setDate(now.getDate() + params.daysFromToday);
  }

  if (target) {
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, "0");
    const dd = String(target.getDate()).padStart(2, "0");
    params.date = `${yyyy}-${mm}-${dd}`;
  }

  return params;
}

async function classifyIntent(userText) {
  const prompt = `${Intention}\n\nUsuario: ${userText}\nDevuelve solo el JSON:`;
  const resp = await model().generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }]}],
    generationConfig: { temperature: 0, responseMimeType: "application/json" }
  });

  let raw = resp.response.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = { intent: "unknown", params: {}, missing: [] };
  }

  if (!parsed || typeof parsed !== "object") {
    parsed = { intent: "unknown", params: {}, missing: [] };
  }
  parsed.params = parsed.params || {};
  parsed.missing = Array.isArray(parsed.missing) ? parsed.missing : [];

  // 🔹 Resolver fechas relativas en el backend
  if (parsed.intent === "create_event") {
    parsed.params = resolveRelativeDate(parsed.params);
  }

  // sanea defaults para listar
  if (parsed.intent === "list_events") {
    if (!parsed.params.range) parsed.params.range = "today";
    if (parsed.params.range === "next_days" && !parsed.params.days) parsed.params.days = 3;
  }

  // validación de campos obligatorios para create_event
  if (parsed.intent === "create_event") {
    const REQUIRED_CREATE_FIELDS = ["title", "date", "startTime", "endTime"];
    const missing = [];
    for (const f of REQUIRED_CREATE_FIELDS) {
      if (!parsed.params[f]) missing.push(f);
    }
    parsed.missing = missing;
    if (!parsed.params.timezone) parsed.params.timezone = "America/Bogota";
  }

  return parsed;
}


module.exports = { classifyIntent };
