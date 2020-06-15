const { EventEmitter } = require('events');

/**
 * Provides an event-driven class based on the EventEmitter
 */
class BaseCommand {
  /**
  * Add EventEmitter.prototype to the current instance
  */
  constructor() {
    Object.assign(this, EventEmitter.prototype);
  }
}

module.exports = BaseCommand;
