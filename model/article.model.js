const db = require("../db/connection");
const { convertTimestampToDate } = require("../db/seeds/utils");

exports.fetchArticleById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comment_id) AS comment_count
      FROM articles
      LEFT JOIN comments ON comments.article_id = articles.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `User for article_id: ${article_id} not found`,
        });
      }
      return rows;
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

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comment_id) AS comment_count FROM articles
       LEFT JOIN comments ON comments.article_id = articles.article_id
       GROUP BY articles.article_id
       ORDER BY created_at DESC;`
    )
    .then(( {rows} ) => {
      return rows;
    });
};
