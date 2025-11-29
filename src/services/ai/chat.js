const { classifyIntent } = require("./gemini");
const { createEvent, listEvents } = require("../actions/calendar");

async function handleChatMessage(tokens, userMessage) {
  const result = await classifyIntent(userMessage);
  const { intent, params, missing } = result;

  if (intent === "create_event") {
    if (missing && missing.length) {
      return {
        ok: false,
        message: `Faltan datos para crear el evento: ${missing.join(", ")}`,
        intent,
        details: { missing, params }
      };
    }
    try {
      const created = await createEvent(tokens, params);
      return {
        ok: true,
        message: "Tu petición ha sido procesada: evento creado con éxito.",
        intent,
        result: {
          id: created.id,
          summary: created.summary,
          start: created.start,
          end: created.end,
          htmlLink: created.htmlLink
        }
      };
    } catch (err) {
      return { ok: false, message: `Error creando evento: ${err.message}`, intent };
    }
  }

  if (intent === "list_events") {
    try {
      const items = await listEvents(tokens, params.range || "today", params.days || 3);
      // reduce campos para el chat
      const reduced = (items || []).map(ev => ({
        summary: ev.summary,
        start: ev.start,
        end: ev.end,
        status: ev.status,
        htmlLink: ev.htmlLink
      }));
      return {
        ok: true,
        message: "Tu petición ha sido procesada: listado de eventos ",
        intent,
        result: reduced
      };
    } catch (err) {
      return { ok: false, message: `Error listando eventos: ${err.message}`, intent };
    }
  }

  // unknown
  return {
    ok: false,
    message: "No reconozco la orden. Puedes pedir: crear evento o listar eventos.",
    intent: "unknown"
  };
}

module.exports = { handleChatMessage };
