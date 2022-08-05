const { fetchArticleById } = require("../model/article.model");
const { fetchCommentsByArticleId } = require("../model/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const { article_id } = req.params;
  Promise.all([
    fetchCommentsByArticleId(article_id),
    fetchArticleById(article_id),
  ]).then(([ comment ]) => {
    const { rows } = comment;
    res.status(200).send({ comments: rows });
  }).catch(next)
};
