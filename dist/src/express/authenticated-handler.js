const AuthorizationProvider = require('../providers/authorization');
const Handler = require('./handler');
const AuthenticationCommand = require('../commands/authentication-command');
const { unauthorized } = require('../base-events');

module.exports = class AuthenticatedHandler extends Handler {
  constructor(request, response, command, headerAttributes = []) {
    const authorizationProvider = new AuthorizationProvider(request.headers, headerAttributes);
    const authenticationCommand = new AuthenticationCommand(command, authorizationProvider);

    super(request, response, authenticationCommand);
  }

  setupListeners(command) {
    command.on(unauthorized, this.onInvalidAuthorization.bind(this));
    super.setupListeners(command);
  }

  onInvalidAuthorization(error) {
    this.response.status(Handler.httpStatus.unauthorized).send(error);
  }
};
