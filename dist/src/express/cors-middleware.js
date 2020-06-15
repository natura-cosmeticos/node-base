const cors = require('cors');

/**
 * Middleware to enable CORS for the application
 * @param {function} allowedOrigins - An array with the origins that will be allowed.
 * If no argument is passed all origins will be allowed
 * @returns {function} - The CORS middleware
 */
module.exports = (allowedOrigins) => {
  if (!allowedOrigins || !(allowedOrigins.length > 0)) {
    return cors();
  }

  return cors({
    origin(origin, callback) {
      if (allowedOrigins.indexOf(origin) === -1) {
        callback(new Error('Not allowed by CORS'));

        return;
      }
      callback(null, true);
    },
  });
};
