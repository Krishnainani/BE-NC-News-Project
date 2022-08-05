const express = require("express");
const { getUsers } = require("./controller/users.controller");
const {
  getArticlesById,
  patchArticleById,
  getArticles,
} = require("./controller/articles.controller");
const { getTopics } = require("./controller/topic.controller");
const { getCommentsByArticleId } = require("./controller/comments.controller");

const app = express();

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticlesById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/users", getUsers);
app.get('/api/articles', getArticles)

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

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
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  }else{
  console.log(err);
  res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = { app };
