const jwt = require('jsonwebtoken');

module.exports = {
  generate: (data, secret, options = undefined) => (
    !options ? jwt.sign(data, secret) : jwt.sign(data, secret, options)
  ),
};
