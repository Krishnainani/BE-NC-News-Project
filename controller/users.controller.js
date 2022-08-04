const { fetchUsers } = require("../model/users.model");

exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users: users });
  });
};
