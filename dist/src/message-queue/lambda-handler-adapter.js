/**
 * Create and execute a handler for an AWS Lambda request
 * @param {Class} HandlerConstructor - The HTTP handler to handle the HTTP interface
 * @param {Class} CommandFactory - The Command Factory that will be injected in the Handler
 * @return {function} - An AWS Lambda compatible handler function
 */
const lambdaAdapter = (HandlerConstructor, CommandFactory) => async (event, context) => {
  const command = new CommandFactory().create();
  const handler = new HandlerConstructor(event, context, command);

  await handler.handle();
};

module.exports = lambdaAdapter;
