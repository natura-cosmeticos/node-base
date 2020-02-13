const _ = require('lodash');

/**
 * @private
 */
const logRequestAttributes = Object.freeze([
  'origin',
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
const logResponseAttributes = Object.freeze(['status']);

/**
 * @private
 */
function commonAttributes(ctx) {
  return {
    fullUrl: ctx.href,
    headers: ctx.headers,
    host: ctx.headers.host,
    url: ctx.origin,
  };
}

/**
 * @private
 */
function logRequest(ctx) {
  ctx.state.logger.log(`Starting ${ctx.method} on ${ctx.path}`, {
    ..._.pick(ctx, logRequestAttributes),
    ...commonAttributes(ctx),
  });
}

/**
 * @private
 */
function logResponse(rawBody, ctx) {
  const contentType = ctx.request.type;

  let body = rawBody;

  /* istanbul ignore if */
  if (contentType && contentType.includes('application/json')) {
    body = JSON.parse(rawBody);
  }

  ctx.state.logger.log(`End request ${ctx.method} on ${ctx.path}`, {
    ..._.pick(ctx.response, logResponseAttributes),
    ...commonAttributes(ctx),
    body,
  });
}

/**
 * @private
 */
function responseEndInterceptor(chunks, ctx) {
  const body = Buffer.concat(chunks).toString();

  logResponse(body, ctx);
}

/**
 * @private
 */
async function setupResponseInterceptors(ctx, next) {
  const chunks = [];

  await next();

  /**
   * Only adds body chunk if it is present
   */
  if (ctx.response.body) {
    chunks.push(ctx.response.body);
  }

  responseEndInterceptor(chunks, ctx);
}

/**
 * Middleware for log the input and output from Koa
 * @param {function} ctx - Koa ctx function
 * @param {function} next - Koa next function
 */
async function loggingMiddleware(ctx, next) {
  logRequest(ctx);
  await setupResponseInterceptors(ctx, next);
}

module.exports = loggingMiddleware;
