const AuthorizationProvider = require('../providers/authorization');
const KoaHandler = require('./handler');
const AuthenticationCommand = require('../commands/authentication-command');
const { unauthorized } = require('../base-events');

module.exports = class AuthenticatedHandler extends KoaHandler {
  /**
   * @param {*} ctx - A Koa context
   * @param {*} command - A command instance
   * @param {*} headerAttributes - An array of possible headers
   */
  constructor(ctx, command, headerAttributes = []) {
    const authorizationProvider = new AuthorizationProvider(ctx.headers, headerAttributes);
    const authenticationCommand = new AuthenticationCommand(command, authorizationProvider);

    super(ctx, authenticationCommand);
  }

  setupListeners(command) {
    command.on(unauthorized, this.onInvalidAuthorization.bind(this));
    super.setupListeners(command);
  }

  onInvalidAuthorization(error) {
    this.ctx.response.body = error;
    this.ctx.response.status = KoaHandler.parseHttpStatus(KoaHandler.httpStatus.unauthorized);
  }
};
