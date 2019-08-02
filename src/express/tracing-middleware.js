const opentracing = require('opentracing');
const url = require('url');
const initJaegerTracer = require('jaeger-client').initTracer;

function loggingRequest(span, req) {
  span.logEvent('request_received_headers', JSON.stringify(req.headers));

  // include some useful tags on the trace
  span.setTag('http.method', req.method);
  span.setTag('span.kind', 'server');
  span.setTag('http.url', req.url);
  // add the span to the request object for handlers to use
  Object.assign(req, { span });
}

function endEvent(span, req, res, pathname) {
  // finalize the span when the response is completed
  return () => {
    span.logEvent('request_finished', JSON.stringify(res.header));
    // Route matching often happens after the middleware is run. Try changing the operation name
    // to the route matcher.
    const opName = (req.route && req.route.path) || pathname;

    span.setOperationName(opName);
    span.setTag('http.status_code', res.statusCode);
    if (res.statusCode >= 400) {
      span.logEvent('request_body', JSON.stringify(req.body));
      span.setTag('error', true);
      span.setTag('sampling.priority', 1);
    }
    span.finish();
  };
}

function middleware(options) {
  const { tracer } = options;

  return function (req, res, next) {
    const wireCtx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
    const { pathname } = url.parse(req.url);
    const span = tracer.startSpan(pathname, { childOf: wireCtx });

    loggingRequest(span, req);

    // include trace ID in headers so that we can debug slow requests we see in
    // the browser by looking up the trace ID found in response headers
    const responseHeaders = {};

    tracer.inject(span, opentracing.FORMAT_TEXT_MAP, responseHeaders);
    Object.keys(responseHeaders).forEach(key => res.setHeader(key, responseHeaders[key]));

    res.on('close', endEvent(span, req, res, pathname));
    res.on('finish', endEvent(span, req, res, pathname));

    next();
  };
}

const opt = {
  logger: {
    error: function logError(msg) {
      console.log('ERROR ', msg);
    },
    info: function logInfo(msg) {
      console.log('INFO  ', msg);
    },
  },
};

/**
 * @private
 */
function tracerMiddleware() {
  const config = {
    reporter: {
      agentHost: process.env.JAEGER_AGENT_HOST,
      agentPort: process.env.JAEGER_AGENT_PORT,
      collectorEndpoint: process.env.JAEGER_COLLECTOR,
    },
    sampler: {
      hostPort: process.env.JAEGER_SAMPLE_HOST_PORT,
      type: process.env.JAEGER_SAMPLE_TYPE ? process.env.JAEGER_SAMPLE_TYPE : 'remote',
    },
    serviceName: process.env.APP_NAME,
  };

  return middleware({ tracer: initJaegerTracer(config, opt) });
}

module.exports = tracerMiddleware;
