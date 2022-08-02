const { fetchTopic, fetchArticleById } = require("../model/topic.model");

exports.getTopics = (req, res, next) => {
  fetchTopic().then((topics) => {
    res.status(200).send({ topics: topics });
  });
};

exports.getArticlesById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then(([articles]) => {
      res.status(200).send({ articles: articles });
    })
    .catch(next);
};
