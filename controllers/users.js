const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const usersRouter = require("express").Router();
const User = require("../models/user");
require("dotenv").config();

const tokenSecret =
  process.env.TOKEN_SECRET ||
  "17851104ceb0f6461c784f7124283dc16c260a6244e99a995f951352137b45972fe3017397235b3573259f886016b722b39f2905664985380662efd140b2eda4";

usersRouter.get("/", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.post("/", async (req, res) => {
  try {
    const body = req.body;

    if (!(body.username && body.password)) {
      res.status(400).json({ error: "Missing password or username" });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
      username: body.username,
      passwordHash: passwordHash,
    });

    const createdUser = await user.save();

    res.json(createdUser);
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

usersRouter.delete("/:id", async (req, res) => {
  try {
    const response = await User.findByIdAndDelete(req.params.id);

    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

usersRouter.post("/login", async (req, res) => {
  try {
    const body = req.body;

    if (!(body.username && body.password)) {
      return res.status(401).json({ error: "Missing username or password" });
    }

    const user = await User.findOne({ username: body.username });
    const checkPassword = await bcrypt.compare(
      body.password,
      user.passwordHash
    );

    if (!(user && checkPassword)) {
      return res
        .status(401)
        .json({ error: "The username or password is invalid" });
    }

    let token = jwt.sign({ username: user.username, id: user.id }, tokenSecret);

    res.json({ token: token, user: user.username, id: user.id });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

module.exports = usersRouter;
