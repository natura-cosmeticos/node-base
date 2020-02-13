const uuid = require('uuid/v4');
const domain = require('domain');
const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const AsyncHooksStorage = require('@naturacosmeticos/async-hooks-storage');

const logAllPattern = '*';
const logLevelDebug = 'debug';
const grayLogFormat = 'graylog';

/** @private */
function requestContext(ctx) {
  return {
    correlationId: AsyncHooksStorage.getEntry('correlation-id'),
    customerId: ctx.headers['x-customer-id'] || null,
    requestId: ctx.headers['request-id'] || uuid(),
    sessionId: ctx.headers['x-session-id'] || null,
  };
}

/** @private */
function createLogger(ctx) {
  const context = requestContext(ctx);

  if ('x-debug-mode-on' in ctx.headers) {
    return new Logger({
      context,
      logLevel: logLevelDebug,
      logPatterns: logAllPattern,
      namespace: '',
    });
  }

  return new Logger({ context, logFormat: grayLogFormat });
}

/**
 * Middleware for log the input and output from Express
 * @param {object} ctx - Koa context object
 * @param {function} next - Koa next function
 */
function contextMiddleware(ctx, next) {
  const currentDomain = domain.create();

  currentDomain.context = requestContext(ctx);
  currentDomain.logger = createLogger(ctx);
  currentDomain.databaseLogger = currentDomain.logger.createChildLogger('db');
  ctx.state.logger = currentDomain.logger.createChildLogger('http');

  currentDomain.run(next);
}

module.exports = contextMiddleware;
