const { fetchArticleById } = require("../model/article.model");

exports.getArticlesById = (req, res, next) => {
    const { article_id } = req.params;
    fetchArticleById(article_id)
      .then(([articles]) => {
        res.status(200).send({ articles: articles });
      })
      .catch(next);
  };
  
  exports.patchArticleById = (req, res, next) => {
  
    res.status(200).send({inc_votes: -100})
  }