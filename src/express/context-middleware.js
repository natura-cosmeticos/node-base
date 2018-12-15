const uuid = require('uuid/v4');
const domain = require('domain');
const Logger = require('@naturacosmeticos/clio-nodejs-logger');

const logAllPattern = '*';
const logLevelDebug = 'debug';
const grayLogFormat = 'graylog';

/** @private */
function requestContext(req) {
  return {
    correlationId: req.headers['x-correlation-id'] || null,
    customerId: req.headers['x-customer-id'] || null,
    requestId: req.headers['request-id'] || uuid(),
    sessionId: req.headers['x-session-id'] || null,
  };
}

/** @private */
function createLogger(req) {
  const context = requestContext(req);

  if ('x-debug-mode-on' in req.headers) {
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
 * @param {function} req - Express req function
 * @param {function} res - Express res function
 * @param {function} next - Express next function
 */
function contextMiddleware(req, res, next) {
  const currentDomain = domain.create();

  currentDomain.context = requestContext(req);
  currentDomain.logger = createLogger(req);
  currentDomain.databaseLogger = currentDomain.logger.createChildLogger('db');
  res.locals.logger = currentDomain.logger.createChildLogger('http');

  currentDomain.run(next);
}

module.exports = contextMiddleware;
