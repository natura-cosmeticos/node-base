const AuthenticatedHandler = require('./authenticated-handler');
const { appTokenAttribute } = require('../config');

module.exports = class UserAuthenticatedHandler extends AuthenticatedHandler {
  constructor(request, response, command) {
    const headerAttributes = [appTokenAttribute];

    super(request, response, command, headerAttributes);
  }
};
