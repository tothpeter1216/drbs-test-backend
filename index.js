const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();
const PORT = process.env.PORT || 3001;
const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";
const tokenSecret =
  process.env.TOKEN_SECRET ||
  "17851104ceb0f6461c784f7124283dc16c260a6244e99a995f951352137b45972fe3017397235b3573259f886016b722b39f2905664985380662efd140b2eda4";

const User = require("./models/user");

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(mongodbUri, {
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

app.delete("/users/:id", async (req, res) => {
  try {
    const response = await User.findByIdAndDelete(req.params.id);

    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error });
  }
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

    let token = jwt.sign({ username: user.username, id: user.id }, tokenSecret);

    res.json({ token: token, user: user.username, id: user.id });
  } catch (error) {
    res.status(400).json({ error: error });
  }
});

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
