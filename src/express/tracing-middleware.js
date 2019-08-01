const opentracing = require("opentracing");
const url = require("url");
const initJaegerTracer = require('jaeger-client').initTracer;

function middleware(options) {
  var tracer = options.tracer;

  return function (req, res, next) {
    const wireCtx = tracer.extract(opentracing.FORMAT_HTTP_HEADERS, req.headers);
    const pathname = url.parse(req.url).pathname;
    const span = tracer.startSpan(pathname, {childOf: wireCtx});
    span.logEvent("request_received_headers", JSON.stringify(req.headers));

    // include some useful tags on the trace
    span.setTag("http.method", req.method);
    span.setTag("span.kind", "server");
    span.setTag("http.url", req.url);

    // include trace ID in headers so that we can debug slow requests we see in
    // the browser by looking up the trace ID found in response headers
    const responseHeaders = {};
    tracer.inject(span, opentracing.FORMAT_TEXT_MAP, responseHeaders);
    Object.keys(responseHeaders).forEach(key => res.setHeader(key, responseHeaders[key]));

    // add the span to the request object for handlers to use
    Object.assign(req, {span});

    // finalize the span when the response is completed
    const finishSpan = () => {
      span.logEvent("request_finished", JSON.stringify(res.header));
      // Route matching often happens after the middleware is run. Try changing the operation name
      // to the route matcher.
      const opName = (req.route && req.route.path) || pathname;
      span.setOperationName(opName);
      span.setTag("http.status_code", res.statusCode);
      if (res.statusCode >= 400) {
        span.logEvent("request_body", JSON.stringify(req.body));
        span.setTag("error", true);
        span.setTag("sampling.priority", 1);
      }
      span.finish();
    };
    res.on('close', finishSpan);
    res.on('finish', finishSpan);

    next();
  };
}

/**
 * @private
 */
function tracerMiddleware(options) {
  const config = {
    serviceName: options.serviceName,
    sampler: {
      type: 'const',
      param: 1,
      ...options.sampler,
    },
    reporter: {
      logSpans: false, // this logs whenever we send a span
      ...options.reporter,
    },
  };
  const opt = {
    logger: {
      info: function logInfo(msg) {
        console.log('INFO  ', msg);
      },
      error: function logError(msg) {
        console.log('ERROR ', msg);
      },
    },
  };
  return middleware({tracer: initJaegerTracer(config, opt)});
}

module.exports = tracerMiddleware;
