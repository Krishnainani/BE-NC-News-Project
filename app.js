const express = require("express");
const { getTopics } = require("./controller/topic.controller");
const app = express();

app.get("/api/topics", getTopics);

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

module.exports = { app };
