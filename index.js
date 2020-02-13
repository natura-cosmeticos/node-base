const Logger = require('@naturacosmeticos/clio-nodejs-logger');
const AppSettings = require('./src/app-settings');
const BaseCommand = require('./src/commands/base-command');
const baseEvents = require('./src/base-events');
const { BucketFactory, PROVIDERS } = require('./src/utils/bucket');
const lambdaAdapter = require('./src/message-queue/lambda-handler-adapter');
const LambdaHandler = require('./src/message-queue/lambda-handler');
const mochaHelpers = require('./src/tests/mocha-helpers');
const Module = require('./src/module');
const NodeInspector = require('./src/development/node-inspector');
const Security = require('./src/security');
const testsHelpers = require('./src/tests/helpers');
const TypeOrmConfigFactory = require('./src/orm/typeorm/typeorm-config-factory');
const typeOrmLogger = require('./src/orm/typeorm/logger');
const ArrayUtils = require('./src/utils/array');
const CorrelationIdHandler = require('./src/utils/correlation-id-handler');
const KoaAppBuilder = require('./src/koa/app-builder');
const KoaCorsMiddleware = require('./src/koa/cors-middleware');
const KoaLoggingMiddleware = require('./src/koa/logging-middleware');
const koaAdapter = require('./src/koa/handler-to-function-adapter');
const KoaAuthenticatedHandler = require('./src/koa/authenticated-handler');
const KoaHandler = require('./src/koa/handler');
const KoaUserAuthenticatedHandler = require('./src/koa/user-authenticated-handler');

module.exports = {
  App: {
    baseEvents,
    Command: BaseCommand,
    Logger,
    Security,
    Settings: AppSettings,
  },
  External: {
    TypeOrmConfigFactory,
    typeOrmLogger,
  },
  Koa: {
    adapter: koaAdapter,
    appBuilder: KoaAppBuilder,
    AuthenticatedHandler: KoaAuthenticatedHandler,
    corsMiddleware: KoaCorsMiddleware,
    Handler: KoaHandler,
    loggingMiddleware: KoaLoggingMiddleware,
    UserAuthenticatedHandler: KoaUserAuthenticatedHandler,
  },
  MessageQueue: {
    lambdaAdapter,
    LambdaHandler,
  },
  Tests: {
    helpers: testsHelpers,
    mochaHelpers,
  },
  Util: {
    ArrayUtils,
    Bucket: {
      BucketFactory,
      PROVIDERS,
    },
    CorrelationIdHandler,
    Module,
    NodeInspector,
  },
};
