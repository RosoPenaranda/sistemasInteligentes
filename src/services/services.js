const {
  createEvent, listEvents,
} = require("./actions/calendar");

const {
  getAuthUrl, handleOAuthCallback, getGoogleClients, hasTokens
} = require("./auth/google");

const { handleChatMessage } = require("./ai/chat");

function allOk () {
  return "Services All Ok!";
};




module.exports = {
  allOk,
  hasTokens,
  createEvent,
  listEvents,
  getAuthUrl,
  handleOAuthCallback,
  getGoogleClients,
  handleChatMessage
};  