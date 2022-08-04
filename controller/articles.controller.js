const {
  fetchArticleById,
  updateArticleById,
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
  updateArticleById(inc_votes, article_id).then((articles) => {
    res.status(201).send({ articles: articles });
  }).catch(next);
};
