const {
  createEvent, listEvents,
} = require("./actions/calendar");

const {
  getAuthUrl, handleOAuthCallback, getGoogleClients
} = require("./auth/google");

const allOk = () => {
  return "Services All Ok!";
};

module.exports = {
  allOk,
  createEvent,
  listEvents,
  getAuthUrl,
  handleOAuthCallback,
  getGoogleClients
};