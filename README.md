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
  * Express Handler to create the interface between your domain and the Express
  * Environment variables from AWS SSM
* Debug mode for development and tests

## How to contribute

You can contribute submitting [pull requests](https://github.com/natura-cosmeticos/node-base/pulls).


### Setup

Run `npm install`.

### Testing

Just run `npm test`.


### Lint

To verify if any lint rule was broken run: `npm run lint`.

### Update docs

Run `npm run docs` to generate a new documentation version.
