const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const { createServer, proxy } = require('aws-serverless-express');
const { eventContext } = require('aws-serverless-express/middleware');
const expressContextMiddleware = require('../express/context-middleware');
const expressLoggingMiddleware = require('../express/logging-middleware');
const expressCorsMiddleware = require('./cors-middleware');

const NodeInspector = require('../development/node-inspector');

/**
 * The Express HTTP port for development mode
 */
const EXPRESS_PORT = process.env.EXPRESS_PORT || 3000;

/**
 * @private
 */
function expressToLambdaHandler(app) {
  const server = createServer(app);

  /* istanbul ignore next */
  return (event, context) => proxy(server, event, context);
}

/**
 * @private
 */
function expressToBodyParser() {
  const bodyParserOptions = {
    limit: '10mb',
  };

  return bodyParser.json(bodyParserOptions);
}

/**
 * @private
 */
function setupAppMiddlewares(app, options) {
  app.use(expressToBodyParser());
  app.use(expressContextMiddleware);
  app.use(expressLoggingMiddleware);
  app.use(expressCorsMiddleware());
  app.use(helmet({ dnsPrefetchControl: false }));

  /* istanbul ignore if */
  if (options.mode === 'lambda') app.use(eventContext());
}

/**
 * @private
 */
/* istanbul ignore next */
function startApp(app) {
  const httpServer = app.listen(EXPRESS_PORT);

  console.log(`Application listening on port ${EXPRESS_PORT}`); // eslint-disable-line no-console

  return httpServer;
}

/**
 * Function to initializes and configures an Express app
 * @param {object} options - accepts mode and developmentMode params
 * @return {object} a object with the expressApp,
 * start method to start the express and the handler function
 * to be the Lambda entrypoint
 */
module.exports = function expressAppBuilder(options = {}) {
  const app = express();

  setupAppMiddlewares(app, options);

  /* istanbul ignore if */
  if (options.developmentMode) new NodeInspector().start();

  return {
    expressApp: app,
    handler: expressToLambdaHandler(app),
    start() {
      /* istanbul ignore next */
      return startApp(app);
    },
  };
};
