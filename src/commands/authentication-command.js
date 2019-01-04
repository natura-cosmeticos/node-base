const { EventEmitter } = require('events');

const BaseCommand = require('./base-command');
const { unauthorized } = require('../base-events');

const invalidAuthorizationError = {
  message: 'authorization.invalid',
};

module.exports = class AuthenticationCommand extends BaseCommand {
  constructor(command, authorizationProvider) {
    super();
    this.command = command;
    this.authorizationProvider = authorizationProvider;
    Object.keys(EventEmitter.prototype).forEach((attr) => {
      if (typeof command[attr] === 'function') {
        this[attr] = (...args) => command[attr](...args);

        return;
      }

      this[attr] = command[attr];
    });
  }

  async execute(args) {
    if (!this.authorizationProvider.isValid()) {
      this.emit(unauthorized, invalidAuthorizationError);

      return;
    }

    const authenticationData = await this.authorizationProvider.getAuthorization();

    await this.command.execute({ ...args, authenticationData });
  }
};
