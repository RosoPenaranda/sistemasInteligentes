const { getGoogleClients } = require("../auth/google");

async function createEvent(tokens, p) {
  const { calendar } = getGoogleClients(tokens);
  const startDateTime = `${p.date}T${p.startTime}:00`;
  const endDateTime = `${p.date}T${p.endTime}:00`;

  const event = {
    summary: p.title,
    description: p.description || "",
    location: p.location || "",
    start: { dateTime: startDateTime, timeZone: p.timezone || "America/Bogota" },
    end: { dateTime: endDateTime, timeZone: p.timezone || "America/Bogota" },
    attendees: (p.attendees || []).map(email => ({ email }))
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event
  });
  return res.data;
}

async function listEvents(tokens, range = "today", days = 3) {
  const { calendar } = getGoogleClients(tokens);
  const now = new Date();
  let timeMin = new Date();
  let timeMax = new Date();

  if (range === "today") {
    timeMin = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    timeMax = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else {
    timeMax.setDate(now.getDate() + days);
  }

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime"
  });
  return res.data.items || [];
}

module.exports = { createEvent, listEvents };
