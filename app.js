const express = require("express");
const { getTopics, getArticlesById, patchArticleById } = require("./controller/topic.controller");
const app = express();

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);
app.patch("/api/articles/:article_id", patchArticleById)

app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Not Found" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = { app };
