const express = require("express");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

require("dotenv").config();
const PORT = process.env.PORT;

const User = require("./models/user");

const app = express();

app.use(express.json());

const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("db connected");
});

app.get("/", (req, res) => {
  res.json({ info: "app works" });
});

app.post("/users", async (req, res) => {
  const body = req.body;
  console.log(body);

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
});

app.delete("/users/:id", async (req, res) => {
  const response = await User.findByIdAndDelete(req.params.id);

  res.status(204).end();
});

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.post("/login", async (req, res) => {
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

    let token = jwt.sign(
      { username: user.username, id: user.id },
      process.env.TOKEN_SECRET
    );

    res.json({ token: token, user: user.username, id: user.id });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
