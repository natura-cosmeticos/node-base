# Architecture Node Base

## For What

The Node Base offers an easier way to implement the coding practices recommended to the Global Sales Platform.

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
  * Express Handler to create the interface between your domain and the Express
  * Environment variables from AWS SSM
* Debug mode for development and tests

### For what architecture need

This project helps achieve the `good maintainability` need, providing a common base for all Node projects that share some common features.

Also this project helps the `ease troubleshooting` need, in two different moments:

* In the local development providing a debug mode
* In different running stages (ex: production) providing a Logger

## How to contribute

You can contribute submitting pull requests.

### Setup

Run `npm install`.

### Testing

Just run `npm test`.


### Lint

To verify if any lint rule was broken run: `npm run lint`.

### Update docs

Run `npm run docs` to generate a new documentation version.
