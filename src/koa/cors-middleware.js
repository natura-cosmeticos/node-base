const cors = require('@koa/cors');

const defaultCorsOptions = {
  allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  keepHeadersOnError: true,
};

/**
 * Middleware to enable CORS for the application
 * @param {Array} allowedOrigins - An array with the origins that will be allowed.
 * If no argument is passed all origins will be allowed
 * @returns {function} - The CORS middleware
 */
// eslint-disable-next-line max-lines-per-function
module.exports = allowedOrigins => async (ctx, next) => {
  if (ctx.method === 'OPTIONS') {
    ctx.status = 204;
  }

  if (!allowedOrigins || !(allowedOrigins.length > 0)) {
    ctx.set(
      'Access-Control-Allow-Origin',
      '*',
    );
    await cors({
      origin(context) {
        context.set(
          'Access-Control-Allow-Origin',
          '*',
        );
      },
      ...defaultCorsOptions,
    })(ctx, next);
  } else {
    await cors({
      origin(context) {
        const { origin } = context.request.headers;

        if (allowedOrigins.indexOf(origin) === -1) {
          throw new Error(`"${origin}" is not allowed by CORS`);
        }
        context.set(
          'Access-Control-Allow-Origin',
          origin,
        );
      },
      ...defaultCorsOptions,
    })(ctx, next);
  }
};
