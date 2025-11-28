const express = require("express");
const fs = require("fs");
const {
  allOk,
  getAuthUrl,
  handleOAuthCallback,
  createEvent,
  listEvents,
  handleChatMessage,
  hasTokens
} = require("../services/services");

const router = express.Router();

function loadTokensFromFile() {
  try {
    const raw = fs.readFileSync("token.json", "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getTokens(req) {
  const fileTokens = loadTokensFromFile();
  if (fileTokens) return fileTokens;

  try {
    if (req.cookies && req.cookies.gtokens) {
      return JSON.parse(req.cookies.gtokens);
    }
  } catch {}
  return null;
}

router.get("/server/", (req, res) => {
  res.json({ status: allOk() });
});

router.get("/auth/google", (req, res) => res.redirect(getAuthUrl()));

router.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  await handleOAuthCallback(code); 
  res.redirect("/?auth=ok");
});

router.get("/auth/status", (req, res) => {
  res.json({ authenticated: hasTokens() });
});

router.post("/events", async (req, res) => {
  try {
    const tokens = getTokens(req);
    if (!tokens) {
      return res.status(401).json({ error: "Falta autenticación (visita /auth/google)" });
    }
    const data = await createEvent(tokens, req.body);
    res.json(data);
  } catch (err) {
    console.error("POST /events error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/events", async (req, res) => {
  try {
    const tokens = getTokens(req);
    if (!tokens) {
      return res.status(401).json({ error: "Falta autenticación (visita /auth/google)" });
    }
    const range = req.query.range || "today";
    const days = Number(req.query.days || 3);
    const data = await listEvents(tokens, range, days);
    res.json(data);
  } catch (err) {
    console.error("GET /events error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const tokens = loadTokensFromFile();
    if (!tokens) return res.status(401).json({ ok: false, message: "Falta autenticación (visita /auth/google)" });

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ ok: false, message: "Falta 'message' (string) en el body" });
    }

    const response = await handleChatMessage(tokens, message);
    return res.json(response);
  } catch (err) {
    console.error("POST /chat error:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

module.exports = router;
