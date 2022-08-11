const {
  fetchArticleById,
  updateArticleById,
  fetchArticles,
  eraseCommentById,
} = require("../model/article.model");

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article: article });
    })
    .catch(next);
};

exports.patchArticleById = (req, res, next) => {
  const { inc_votes } = req.body;
  const { article_id } = req.params;
  updateArticleById(inc_votes, article_id)
    .then((article) => {
      res.status(201).send({ article: article });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  fetchArticles(sort_by, order, topic).then((articles) => {
    res.status(200).send({ articles: articles });
  }).catch(next)
};

exports.deleteCommentById = (req,res,next) => {
  const {comment_id} = req.params;
  eraseCommentById(comment_id).then((comment) =>{
    res.status(204).send()
  }).catch(next)
}