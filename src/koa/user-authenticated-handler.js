const AuthenticatedHandler = require('./authenticated-handler');
const { appTokenAttribute } = require('../config');

module.exports = class UserAuthenticatedHandler extends AuthenticatedHandler {
  constructor(ctx, command) {
    const headerAttributes = [appTokenAttribute];

    super(ctx, command, headerAttributes);
  }
};
