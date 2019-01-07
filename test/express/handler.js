const { assert } = require('chai');
const express = require('express');
const request = require('supertest');
const uuid = require('uuid/v4');

const HttpHandler = require('../../src/express/handler');
const adapt = require('../../src/express/handler-to-function-adapter');
const { App: { baseEvents } } = require('../../index');
const { factory, FakeCommand } = require('../../index').Tests.helpers;

describe('HttpHandler', () => {
  describe('base cases', () => {
    it('have an attribute returning the http statuses', () => {
      // when
      const { httpStatus } = HttpHandler;

      // then
      assert.equal(httpStatus.ok, 200);
      assert.equal(httpStatus.notFound, 404);
      assert.equal(httpStatus.unprocessableEntity, 422);
      assert.equal(httpStatus.internalServerError, 500);
    });

    it('return a 200 when the command emit success', async () => {
      // given
      class FakeHandler extends HttpHandler {}
      const { httpStatus } = HttpHandler;
      const app = express();

      app.get('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.success))));
      // when
      const response = await request(app).get('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.ok);
    });

    it('return a 404 when the command emit notfound', async () => {
      // given
      class FakeHandler extends HttpHandler {}

      const { httpStatus } = HttpHandler;

      // when
      const app = express();

      app.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.notFound))));

      // when
      const response = await request(app).post('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.notFound);
    });

    it('return a 422 when the command emit validationFailed', async () => {
      // given
      class FakeHandler extends HttpHandler {}

      const { httpStatus } = HttpHandler;

      // when
      const app = express();

      app.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.validationFailed))));

      // when
      const response = await request(app).post('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.unprocessableEntity);
    });

    it('return a 204 when the command emit noContent', async () => {
      // given
      class FakeHandler extends HttpHandler {}

      const { httpStatus } = HttpHandler;

      // when
      const app = express();

      app.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.noContent))));

      // when
      const response = await request(app).post('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.noContent);
    });

    it('return a 500 when the command emit error', async () => {
      // given
      class FakeHandler extends HttpHandler {}

      const { httpStatus } = HttpHandler;

      // when
      const app = express();

      app.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.error))));

      // when
      const response = await request(app).post('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.internalServerError);
    });
  });

  describe('edge cases', () => {
    it('return a 500 when the command is not passed', async () => {
      // given
      const { httpStatus } = HttpHandler;
      const app = express();

      app.get('/hello', adapt(HttpHandler, factory(null)));

      // when
      const response = await request(app).get('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.internalServerError);
    });
  });
  describe('headers whitelist in buildInput', () => {
    it('returns only default whitelisted headers on buildInput() headers attribute', () => {
      const requestHeaders = {
        headers: {
          'another-token': uuid(),
          'correlation-id': uuid(),
          'x-app-token': uuid(),
        },
        params: {},
        query: {},
      };
      const handler = new HttpHandler(requestHeaders, {}, {});
      const whitelistedHeaders = {
        headers: {
          correlationId: requestHeaders.headers['correlation-id'],
          xAppToken: requestHeaders.headers['x-app-token'],
        },
      };
      const response = handler.buildInput();

      assert.deepEqual(response, whitelistedHeaders);
    });
  });
});
