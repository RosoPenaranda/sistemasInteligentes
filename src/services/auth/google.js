const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI // ej: http://localhost:3000/oauth2callback
);

function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive"
  ];
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes
  });
}

async function handleOAuthCallback(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  try {
    fs.writeFileSync("token.json", JSON.stringify(tokens, null, 2));
    console.log("token.json guardado");
  } catch (e) {
    console.error("No se pudo guardar token.json:", e);
  }

  return tokens;
}

function getGoogleClients(tokens) {
  oauth2Client.setCredentials(tokens);
  return {
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
    drive: google.drive({ version: "v3", auth: oauth2Client })
  };
}

module.exports = { getAuthUrl, handleOAuthCallback, getGoogleClients };
