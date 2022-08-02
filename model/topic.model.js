const db = require("../db/connection");

exports.fetchTopic = () => {
  return db.query("SELECT * FROM topics").then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = () => {
  return db
    .query(
      `SELECT author, title, article_id, body, topic, created_at, votes, username FROM articles, users WHERE username = author`
    )
    .then(({ rows }) => {
     const articles = rows.map((articles) => {
      if(articles.author === articles.username){
        delete articles.username;
      }
      return rows;
    })
    return articles;
    });
};
