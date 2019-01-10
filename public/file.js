const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");

const fs = require("fs");
const moment = require("moment");
const mdq = require("mongo-date-query");
const json2csv = require("json2csv").parse;
const path = require("path");
const fields = ["name", "email"];

router.get("/", async function(req, res) {
  User.find(function(err, users) {
    if (err) {
      return res.status(500).json({ err });
    } else {
      let csv;
      try {
        csv = json2csv(users, { fields });
      } catch (err) {
        return res.status(500).json({ err });
      }
      const dateTime = moment().format("YYYYMMDDhhmmss");
      const filePath = path.join(
        __dirname,
        "..",
        "public",
        "exports",
        "csv-" + dateTime + ".csv"
      );
      fs.writeFile(filePath, csv, function(err) {
        if (err) {
          return res.json(err).status(500);
        } else {
          setTimeout(function() {
            fs.unlinkSync(filePath);
          }, 50000);
          const file_1 = path.join(
            __dirname,
            "/exports/csv-" + dateTime + ".csv"
          );
          console.log(file_1);

          return res.download(file_1);
        }
      });
    }
  });
});

module.exports = router;
