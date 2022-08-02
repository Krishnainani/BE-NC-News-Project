const { fetchTopic, fetchArticleById } = require("../model/topic.model");

exports.getTopics = (req, res, next) => {
  fetchTopic().then((topics) => {
    res.status(200).send({ topics: topics });
  });
};

exports.getArticlesById = (req,res, next) => {
  fetchArticleById().then(([articles]) => {
    console.log(articles)
    res.status(200).send({articles: articles})
  })
}