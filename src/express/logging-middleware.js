const _ = require('lodash');

/**
 * @private
 */
const logRequestAttributes = Object.freeze([
  'baseUrl',
  'body',
  'method',
  'params',
  'protocol',
  'query',
  'upgrade',
]);
/**
 * @private
 */
const logResponseAttributes = Object.freeze(['statusCode']);

/**
 * @private
 */
function commonAttributes(req) {
  return {
    fullUrl: `${req.protocol}://${req.headers.host}${req.originalUrl}`,
    headers: req.rawHeaders,
    host: req.headers.host,
    url: req.originalUrl,
  };
}

/**
 * @private
 */
function logRequest(req, res) {
  res.locals.logger.log(`Starting ${req.method} on ${req.path}`, {
    ..._.pick(req, logRequestAttributes),
    ...commonAttributes(req),
  });
}

/**
 * @private
 */
function logResponse(rawBody, req, res) {
  const contentType = res.get('content-type');

  let body = rawBody;

  /* istanbul ignore if */
  if (contentType && contentType.includes('application/json')) {
    body = JSON.parse(rawBody);
  }
  res.locals.logger.log(`End request ${req.method} on ${req.path}`, {
    ..._.pick(req, logResponseAttributes),
    ...commonAttributes(req),
    body,
  });
}

/**
 * @private
 */
function responseEndInterceptor({ chunk, chunks }, end, req, res) {
  /* istanbul ignore if */
  if (chunk) {
    chunks.push(Buffer.from(chunk));
  }

  const body = Buffer.concat(chunks).toString();

  logResponse(body, req, res);
  end.call(res, body);
}

/**
 * @private
 */
function setupResponseInterceptors(req, res) {
  const { end, write } = res;
  const chunks = [];

  /* istanbul ignore next */
  res.write = (chunk) => {
    chunks.push(chunk);
    write.call(res, chunk);
  };

  res.end = (chunk) => {
    const data = { chunk, chunks };

    responseEndInterceptor(data, end, req, res);
  };
}

/**
 * Middleware for log the input and output from Express
 * @param {function} req - Express req function
 * @param {function} res - Express res function
 * @param {function} next - Express next function
 */
function loggingMiddleware(req, res, next) {
  logRequest(req, res);
  setupResponseInterceptors(req, res);
  next();
}

module.exports = loggingMiddleware;
