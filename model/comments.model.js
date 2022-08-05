const db = require("../db/connection");

exports.fetchCommentsByArticleId = (article_id) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      return { rows };
    });
};

exports.updateCommentByArticleId = () => {
  return db.query("INSERT INTO comments (body, article_id, author) VALUES ('api', 1, 'butter_bridge' ) RETURNING *;").then(({rows}) => {
    return rows;
  })
}