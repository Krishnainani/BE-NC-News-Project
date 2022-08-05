const { fetchArticleById } = require("../model/article.model");
const {
  fetchCommentsByArticleId,
  createCommentByArticleId,
} = require("../model/comments.model");
const { getUsersForComments } = require("../model/users.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    fetchCommentsByArticleId(article_id),
    fetchArticleById(article_id),
  ])
    .then(([comment]) => {
      const { rows } = comment;
      res.status(200).send({ comments: rows });
    })
    .catch(next);
};

exports.postCommentsByArticleId = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;
  Promise.all([
    getUsersForComments(username),
    fetchArticleById(article_id),
    createCommentByArticleId(username, body, article_id),
  ])
    .then((response) => {
      const comment = response[2];
      res.status(201).send({ comment: comment });
    })
    .catch(next);
};
