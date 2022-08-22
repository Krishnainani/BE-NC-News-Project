const endpoint = require("./endpoints.json")

exports.endpoint = (req, res) => {
    res.send({endpoint})
}