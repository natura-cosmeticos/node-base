const uuidV4 = require('uuid/v4');
const http = require('http');

const originalHttpCreateServer = http.createServer;
const originalRequest = http.request;
const asyncHooksStorage = require('./async-hooks-storage');

const defaultCorrelationIdHeader = 'correlation-id';

function wrappedListener(correlationIdHeader, listener) {
  return (req, res, next) => {
    // Create new async-hooks entry for this API execution context
    asyncHooksStorage.newEntry('httpRequest');
    // Obtain correlation-id from the Request Headers
    let correlationId = req.headers[correlationIdHeader];

    // If there is no correlation-id header, create a new correlation-id using UUIDV4
    if (typeof req.headers[correlationIdHeader] === 'undefined') {
      correlationId = uuidV4();
    }
    // Set the correlation-id into the current async-hooks storage entry
    asyncHooksStorage.setEntry(correlationIdHeader, correlationId);
    // Set the correlation-id header in the response object
    res.setHeader(correlationIdHeader, correlationId);
    // Execute the original http listener received as parameter
    listener(req, res, next);
  };
}

function wrapHttpCreateServer(correlationIdHeader) {
  return function _wrappedHttpCreateServer(listener) {
    // Obtain wrapped listener that will last for the request lifecycle and keep
    // the correlation-id alive until the request is completely resolved or rejected
    const newListener = wrappedListener(correlationIdHeader, listener);

    // Process the request thru the wrapped listener
    return originalHttpCreateServer(newListener);
  };
}

// eslint-disable-next-line complexity
function injectCorrelationId(options, correlationIdHeader) {
  // Check if there is a current async-hooks storage entry available
  if (asyncHooksStorage.currentEntry) {
    // Check if an request options object was sent
    if (!options) {
      // If not, create a new object with no headers
      // eslint-disable-next-line no-param-reassign
      options = { headers: {} };
    } else if (!options.headers) {
      // If request option object exists but there is
      // no headers object, create an empty one
      // eslint-disable-next-line no-param-reassign
      options.headers = {};
    }
    // Check if there is a correlation-id header available
    // in the current async-hook entry context
    if (asyncHooksStorage.currentEntry.context
      && asyncHooksStorage.currentEntry.context.has(correlationIdHeader)) {
      // Update the request options.headers property
      // to include the correlation-id header
      // eslint-disable-next-line no-param-reassign
      options.headers[correlationIdHeader] = asyncHooksStorage.getEntry(correlationIdHeader);
    }
  }
}

function wrapHttpRequest(correlationIdHeader) {
  return function _wrappedHttpRequest(options, cb) {
    // Inject/overwrite the correlation-id header into the HTTP Request header
    injectCorrelationId(options, correlationIdHeader);

    // Process the request thru the original Request function
    return originalRequest(options, cb);
  };
}

function replaceGlobalHttpObjects(correlationIdHeader) {
  // Retain the original global HTTP server CreateServer property
  http.createServer__original = originalHttpCreateServer;
  // Wrap the global HTTP server
  http.createServer = wrapHttpCreateServer(correlationIdHeader);
  // Retain the original global HTTP server Request property
  http.request__original = originalRequest;
  // Wrap the global HTTP request
  http.request = wrapHttpRequest(correlationIdHeader);
}

module.exports = {
  activate: (correlationIdHeader = defaultCorrelationIdHeader) => {
    replaceGlobalHttpObjects(correlationIdHeader);
    asyncHooksStorage.enable();
  },
};
