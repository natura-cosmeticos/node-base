require('../utils/correlation-id-handler').activate('correlation-id');
const bodyParser = require('body-parser');
const koa = require('koa');
const helmet = require('koa-helmet');
const serverless = require('aws-serverless-koa');
const awsServerlessKoaMiddleware = require('aws-serverless-koa/middleware');
const koaContextMiddleware = require('./context-middleware');
const koaLoggingMiddleware = require('./logging-middleware');
const koaCorsMiddleware = require('./cors-middleware');

const NodeInspector = require('../development/node-inspector');

/**
 * The Koa HTTP port for development mode
 */
const KOA_PORT = process.env.KOA_PORT || 3000;

/**
 * @private
 */
function koaToBodyParser() {
  const bodyParserOptions = {
    limit: '10mb',
  };

  return bodyParser.json(bodyParserOptions);
}

/**
 * @private
 */
function setupAppMiddlewares(app, options) {
  app.use(koaToBodyParser());
  app.use(koaContextMiddleware);
  app.use(koaLoggingMiddleware);
  app.use(koaCorsMiddleware());
  app.use(helmet({ dnsPrefetchControl: false }));

  /* istanbul ignore if */
  if (options.mode === 'lambda') app.use(awsServerlessKoaMiddleware());
}

/**
 * @private
 */
/* istanbul ignore next */
function startApp(app) {
  const httpServer = app.listen(KOA_PORT);

  console.log(`Application listening on port ${KOA_PORT}`); // eslint-disable-line no-console

  return httpServer;
}

/**
 * Function to initializes and configures a Koa app
 * @param {object} options - accepts mode and developmentMode params
 * @return {object} a object with the expressApp,
 * start method to start the koa and the handler function
 * to be the Lambda entrypoint
 */
module.exports = function expressAppBuilder(options = {}) {
  const app = koa();

  setupAppMiddlewares(app, options);

  /* istanbul ignore if */
  if (options.developmentMode) new NodeInspector().start();

  return {
    expressApp: app,
    handler: serverless(app),
    start() {
      /* istanbul ignore next */
      return startApp(app);
    },
  };
};
