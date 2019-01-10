const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();
const validateObjectId = require("../middleware/validateObjectId");

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

// fetch all user list

router.get("/", auth, async (req, res) => {
  if (req.query.search) {
    const a = `${req.query.search}`;
    const users = await User.find()
      .or([
        {
          name: { $regex: req.query.search, $options: "i" }
        },
        {
          email: { $regex: req.query.search, $options: "i" }
        }
      ])
      .select({ name: 1, email: 1 });
    res.send(users);
  } else {
    const users = await User.find().select({
      name: 1,
      email: 1
    });
    res.send(users);
  }
});

// add user

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("B4c0//", salt, function(err, hash) {
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

// update user

router.put("/:id", validateObjectId, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name
    },
    { new: true }
  );

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(_.pick(user, ["_id", "name", "email"]));
});

// delete user

router.delete("/:id", validateObjectId, async (req, res) => {
  const user = await User.findByIdAndRemove(req.params.id);

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(_.pick(user, ["_id", "name", "email"]));
});

// find a user by id

router.get("/:id", validateObjectId, async (req, res) => {
  const user = await User.findById(req.params.id).select({ name: 1, email: 1 });

  if (!user)
    return res.status(404).send("The user with the given ID was not found.");

  res.send(user);
});

module.exports = router;
