const winston = require("winston");
const express = require("express");
const path = require("path");
const app = express();
var cors = require("cors");

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();
require("./startup/prod")(app);

const port = process.env.PORT || 3001;
const server = app.listen(port, () =>
  winston.info(`Listening on port ${port}...`)
);

module.exports = server;
