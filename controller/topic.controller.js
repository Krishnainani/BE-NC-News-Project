const { fetchTopic } = require("../model/topic.model");

exports.getTopics = (req, res, next) => {
  fetchTopic().then((topics) => {
    res.status(200).send({ topics: topics });
  });
};
