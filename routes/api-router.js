const apiRouter = require('express').Router();

apiRouter.get('/', (req, res) => {
  res.status(200).send(`Welcome to Krishna's API\n Every thing looks fine from API Router`);
});

module.exports = apiRouter;