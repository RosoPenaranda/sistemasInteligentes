const express = require("express");
var cors = require("cors");
var cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();
const app = express();
// Settings

app.set("port", process.env.PORT || 3001);

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

// Middlewares

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Routes

app.use(require("./routes/routes"));
app.get("/checkHealth", function (req, res) {
  res.status(200).send("All Ok!");
});

// init server
app.listen(app.get("port"), () => {
  console.log("Server on port " + app.get("port"));
});
