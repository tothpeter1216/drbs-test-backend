const express = require("express");
const bcrypt = require("bcrypt");
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

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
