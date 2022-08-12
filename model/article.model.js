const db = require("../db/connection");

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
      return rows[0];
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
      return rows[0];
    });
};

exports.fetchArticles = (sort_by = "created_at", order = "desc", topic) => {
  const validSort = ["created_at", "votes"];
  const validTopics = ["mitch", "cats", "paper"];

  if (sort_by.length === 0) {
    sort_by += "created_at";
  }
  if (order.length === 0) {
    order += "desc";
  }

  if (!validSort.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }

  if (order !== "asc" && order !== "desc") {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }
  if (!validTopics.includes(topic) && topic !== undefined) {
    return Promise.reject({ status: 400, msg: "Invalid topic query" });
  }

  let sqlString = `SELECT articles.*, COUNT(comment_id) AS comment_count FROM articles
       LEFT JOIN comments ON comments.article_id = articles.article_id `;

  if (topic) sqlString += `WHERE articles.topic = '${topic}' `;

  sqlString += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order};`;

  return db.query(sqlString).then(({ rows }) => {
    return rows;
  });
};
