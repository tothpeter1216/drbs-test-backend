const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const usersRouter = require("./controllers/users");

require("dotenv").config();
const PORT = process.env.PORT || 3001;
const mongodbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/test";

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api/users", usersRouter);

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

app.listen(PORT, () => {
  console.log("listening on port " + PORT);
});
