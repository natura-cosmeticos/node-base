const _ = require('lodash');
const { STATUS_CODES } = require('http');

module.exports = _(STATUS_CODES)
  .invert()
  .mapKeys((value, key) => _.camelCase(key))
  .value();
