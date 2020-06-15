/**
 * Base handler to implement AWS Lambda listeners
 */
class LambdaHandler {
  /**
    * Initialize a ExpressHandler instance with the an specific domain command
    * For more information about the arguments see https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html
    * @param {Object} event - The AWS Lambda event arguments
    * @param {Object} context - The AWS Lambda context object
    * @param {Object} command - A Command instance
    */
  constructor(event, context, command) {
    /**
     * @param {Object} request - The AWS Lambda event arguments
     */
    this.event = event;
    /**
     * @param {Object} request - The AWS Lambda context object
     */
    this.context = context;
    /**
     * @param {Object} request - A Command Instance
     */
    this.command = command;
  }

  /**
   * Invoke the command execute method, setting up the default listeners and
   * handling an exception if occurred
   */
  async handle() { // eslint-disable-line require-await
    throw new Error('Not implemented');
  }
}

module.exports = LambdaHandler;
