const db = require("../db/connection");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT author, title, article_id, body, topic, created_at, votes, username 
        FROM articles, users 
        WHERE username = author
        AND article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `User for article_id: ${article_id} not found`,
        });
      }
      const articles = rows.map((articles) => {
        if (articles.author === articles.username) {
          delete articles.username;
        }
        return rows;
      });
      return articles;
    });
};

exports.updateArticleById = (inc_votes, article_id) => {
  return db
    .query(
      "UPDATE articles SET votes = votes+($1) WHERE article_id = ($2) RETURNING *;",
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Not found`,
        });
      }
      return rows;
    });
};
