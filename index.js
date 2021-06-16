const express = require("express");
require("dotenv").config();
const PORT = process.env.PORT;
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

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
