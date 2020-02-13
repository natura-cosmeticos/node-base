/**
 * Function to initializes and configures a Koa app
 * @param {Class} HandlerConstructor - The HTTP handler to handle the HTTP interface
 * @param {Class} CommandFactory - The Command Factory that will be injected in the Handler
 * @param {Koa.Context} ctx - The koa context
 * @return {function} - a callback function to Koa route
 */
module.exports = (HandlerConstructor, CommandFactory) => (ctx) => {
  const command = new CommandFactory().create();
  const handler = new HandlerConstructor(ctx, command);

  handler.handle();
};
