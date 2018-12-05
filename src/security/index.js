const jwt = require('jsonwebtoken');

const defaultOptions = Object.freeze({
  expiresIn: '1d',
});

class JWT {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  decode(token) {
    return jwt.decode(token);
  }

  verify(token) {
    return jwt.verify(token, this.secretKey);
  }

  sign(payload, options = {}) {
    return jwt.sign(payload, this.secretKey, { ...defaultOptions, ...options });
  }
}

module.exports = {
  JWT,
};
