const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const file = require("../public/file");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/file", file);
  app.use(error);
};
