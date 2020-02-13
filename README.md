# node-base
[![Known Vulnerabilities](https://snyk.io/test/github/natura-cosmeticos/node-base/badge.svg)](https://snyk.io/test/github/natura-cosmeticos/node-base)
[![Build Status](https://api.travis-ci.org/natura-cosmeticos/node-base.svg?branch=master)](https://travis-ci.org/natura-cosmeticos/node-base)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/9ee01fcbab76443393f4e01d9711cf6f)](https://www.codacy.com/app/fabricioffc/node-base?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=natura-cosmeticos/node-base&amp;utm_campaign=Badge_Grade)

## What for

The Node Base offers an easier way to implement the coding practices recommended by Natura Architecture Team.

## What it's included

* Docker environment
* Isomorphic code, capable to run in local environment, lambda and kubernetes
* Logging using the structure recommended
  * Logger module supporting with correlation id, session id, etc
  * Logging middleware to log input and output data
  * TypeORM logger module using the logger module
* Tests helpers to improve productivity
* Abstraction to use code practices recommended
  * Base Command to create events based commands
  * Koa Handler to create the interface between your domain and the Koa
  * Environment variables from AWS SSM
* Debug mode for development and tests

## Changelog

For our changelog, please check our [releases](https://github.com/natura-cosmeticos/node-base/releases) page on github

## How to contribute

You can contribute submitting [pull requests](https://github.com/natura-cosmeticos/node-base/pulls).

### Setup

Run `npm install`.

### Commiting

We use conventional commits for version bumping and changelog generation. When commit, please use the commitizen cli by wunning `npm run cm`. For additional information about conventional commits, check their page [here](https://www.conventionalcommits.org/).

### Testing

Just run `npm test`.

### Lint

To verify if any lint rule was broken run: `npm run lint`.

### Update docs

Run `npm run docs` to generate a new documentation version.

## Docs

Here is a full disclosure about what this library exports

```js
module.exports = {
  App: {
    /**
     * List of base events of an app
     */
    baseEvents,
    /**
     * Event emitter constructor
     */
    Command: BaseCommand,
    /**
     * Default export of @naturacosmeticos/clio-nodejs-logger
     */
    Logger,
    /**
     * JWT class for json web token validation
     */
    Security,
    /**
     * AWS SSM initialization for environment variables
     */
    Settings: AppSettings,
  },
  External: {
    /**
     * TypeOrm factory for default configuration
     */
    TypeOrmConfigFactory,
    /**
     * Logger for TypeOrm
     */
    typeOrmLogger,
  },
  Koa: {
    /**
     * Koa adapter for AWS Lambda
     */
    adapter: koaAdapter,
    /**
     * Builds a koa app instance
     */
    appBuilder: KoaAppBuilder,
    /**
     * Koa authentication middleware
     */
    AuthenticatedHandler: KoaAuthenticatedHandler,
    /**
     * Koa cors middleware
     */
    corsMiddleware: KoaCorsMiddleware,
    /**
     * Base handler for events
     */
    Handler: KoaHandler,
    /**
     * Koa logging middleware
     */
    loggingMiddleware: KoaLoggingMiddleware,
    /**
     * Handler for user authenticated actions
     */
    UserAuthenticatedHandler: KoaUserAuthenticatedHandler,
  },
  MessageQueue: {
    /**
     * AWS Lambda adapter for koa app instances
     */
    lambdaAdapter,
    /**
     * AWS Lambda handler for event handling of koa apps
     */
    LambdaHandler,
  },
  Tests: {
    /**
     * Test helping suite, includes a command and command factory interface
     */
    helpers: testsHelpers,
    /**
     * Mocha test runner helpers
     */
    mochaHelpers,
  },
  Util: {
    /**
     * Helper functions for array handling
     */
    ArrayUtils,
    Bucket: {
      /**
       * BucetFactory class for helping with S3 Bucket handling
       */
      BucketFactory,
      /**
       * Set of providers
       */
      PROVIDERS,
    },
    /**
     * HTTP handler for correlation id injection on requests 
     * that don't have one
     */
    CorrelationIdHandler,
    /**
     * Class for appending to NODE_PATH
     */
    Module,
    /**
     * Node.js inspector wrapper that provides a proxy 
     * without authentication allowing the same debug 
     * URL to be used across process restarts
     */
    NodeInspector,
  },
}
```
