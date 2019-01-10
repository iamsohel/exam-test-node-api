const Joi = require("joi");
const bcryptjs = require("bcryptjs");
const _ = require("lodash");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const { User, validate } = require("../models/user");

// login method

router.post("/login", async (req, res) => {
  //console.log('loging', req);
  const { error } = validateLoign(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  bcryptjs.compare("B4c0//", user.password).then(isMatch => {
    if (isMatch) {
      //const token = user.generateAuthToken();
      let body = {
        id: user.id,
        name: user.name,
        token: user.generateAuthToken()
      };
      res.send(body);
    } else {
      res.status(400).send("Invalid email or password.");
    }
  });
});

// registration method

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  bcryptjs.genSalt(10, function(err, salt) {
    bcryptjs.hash("B4c0//", salt, function(err, hash) {
      if (hash) {
        user.password = hash;
        user.save();

        const token = user.generateAuthToken();
        res
          .header("x-auth-token", token)
          .send(_.pick(user, ["_id", "name", "email"]));
      }
    });
  });
});

function validateLoign(req) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
