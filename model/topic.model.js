const db = require("../db/connection");
const { convertTimestampToDate } = require("../db/seeds/utils");

exports.fetchTopic = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

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
