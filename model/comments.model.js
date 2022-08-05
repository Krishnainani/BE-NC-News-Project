const db = require("../db/connection");
const { fetchArticleById } = require("./article.model");

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      return { rows };
    });
};


exports.createCommentByArticleId = (username, body, article_id) => {
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *;",
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

