require('../utils/correlation-id-handler').activate('correlation-id');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const Koa = require('koa');
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
    jsonLimit: '10mb',
    textLimit: '10mb',
  };

  return bodyParser(bodyParserOptions);
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
 * @return {object} a object with the koaApp,
 * start method to start the koa and the handler function
 * to be the Lambda entrypoint
 */
module.exports = function koaAppBuilder(options = {}) {
  const app = new Koa();

  const router = new Router();

  setupAppMiddlewares(app, options);

  /* istanbul ignore if */
  if (options.developmentMode) new NodeInspector().start();

  return {
    handler: serverless(app),
    koaApp: app,
    router,
    start() {
      /* istanbul ignore next */
      return startApp(app);
    },
  };
};
