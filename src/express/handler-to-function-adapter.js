/**
 * Function to initializes and configures an Express app
 * @param {Class} HandlerConstructor - The HTTP handler to handle the HTTP interface
 * @param {Class} CommandFactory - The Command Factory that will be injected in the Handler
 * @return {function} - a callback function to Express route
 */
module.exports = (HandlerConstructor, CommandFactory) => (request, response) => {
  const command = new CommandFactory().create();
  const handler = new HandlerConstructor(request, response, command);

  handler.handle();
};
