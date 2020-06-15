const BaseCommand = require('../commands/base-command');

/**
 * A command to use in your tests to fake an event and the data within the event
 * @extends {BaseCommand}
 */
class FakeCommand extends BaseCommand {
  /**
  * @param {string} eventName - the event name that will be fired
  * @param {object} args - the object that will be returned when the event is fired
  */
  constructor(eventName, args) {
    super();
    /**
    * @type {object}
    */
    this.args = args;
    /**
    * @type {string}
    */
    this.eventName = eventName;
  }

  /**
   * emits the event
   */
  execute() {
    this.emit(this.eventName, this.args);
  }
}

/**
 * Creates a factory using the factory pattern with the create method returning the command passed
 * @param {object} - the command object
 * @return {Class} a Class with an create function
 */
function factory(command) {
  return class FakeFactory {
    create() {
      return command;
    }
  };
}

module.exports = {
  factory,
  FakeCommand,
};
