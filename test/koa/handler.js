const { assert } = require('chai');
const Koa = require('koa');
const Router = require('koa-router');
const request = require('supertest');
const uuid = require('uuid/v4');
const { isUUID } = require('validator');

const HttpHandler = require('../../src/koa/handler');
const adapt = require('../../src/koa/handler-to-function-adapter');
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
      assert.equal(httpStatus.badRequest, 400);
    });

    it('return a 200 when the command emit success and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }
      const { httpStatus } = HttpHandler;
      const app = new Koa();
      const correlationId = uuid();
      const router = new Router();

      router.get('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.success))));
      app.use(router.routes());

      // when
      const response = await request(app.callback()).get('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      assert.equal(response.headers['correlation-id'], correlationId);
    });

    it('return a 200 when the command emit success and send correlation id with response even when none was passed', async () => {
      // given
      class FakeHandler extends HttpHandler { }
      const { httpStatus } = HttpHandler;
      const app = new Koa();
      const router = new Router();

      router.get('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.success))));

      app.use(router.routes());
      // when
      const response = await request(app.callback()).get('/hello');

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      assert.equal(isUUID(response.headers['correlation-id']), true);
    });

    it('return a 404 when the command emit notfound and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }

      const { httpStatus } = HttpHandler;

      // when
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.notFound))));

      app.use(router.routes());

      // when
      const response = await request(app.callback()).post('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.notFound);
      assert.equal(response.headers['correlation-id'], correlationId);
    });

    it('return a 422 when the command emit validationFailed and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }

      const { httpStatus } = HttpHandler;

      // when
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.validationFailed))));
      app.use(router.routes());

      // when
      const response = await request(app.callback()).post('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.unprocessableEntity);
      assert.equal(response.headers['correlation-id'], correlationId);
    });

    it('return a 204 when the command emit noContent and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }

      const { httpStatus } = HttpHandler;

      // when
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.noContent))));
      app.use(router.routes());

      // when
      const response = await request(app.callback()).post('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.noContent);
      assert.equal(response.headers['correlation-id'], correlationId);
    });

    it('return a 500 when the command emit error and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }

      const { httpStatus } = HttpHandler;

      // when
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.error))));

      app.use(router.routes());

      // when
      const response = await request(app.callback()).post('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.internalServerError);
      assert.equal(response.headers['correlation-id'], correlationId);
    });

    it('return a 400 when the command emit error and send correlation id header with response', async () => {
      // given
      class FakeHandler extends HttpHandler { }

      const { httpStatus } = HttpHandler;

      // when
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.post('/hello', adapt(FakeHandler, factory(new FakeCommand(baseEvents.badRequest))));
      app.use(router.routes());

      // when
      const response = await request(app.callback()).post('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.badRequest);
      assert.equal(response.headers['correlation-id'], correlationId);
    });
  });

  describe('edge cases', () => {
    it('return a 500 when the command is not passed', async () => {
      // given
      const { httpStatus } = HttpHandler;
      const app = new Koa();
      const router = new Router();
      const correlationId = uuid();

      router.get('/hello', adapt(HttpHandler, factory(null)));

      app.use(router.routes());

      // when
      const response = await request(app.callback()).get('/hello').set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.internalServerError);
      assert.equal(response.headers['correlation-id'], correlationId);
    });
  });
  describe('headers whitelist in buildInput', () => {
    it('returns only default whitelisted headers on buildInput() headers attribute', () => {
      const context = {
        headers: {
          'another-token': uuid(),
          'correlation-id': uuid(),
          'x-app-token': uuid(),
        },
        params: {},
        query: {},
      };
      const handler = new HttpHandler(context, {});
      const whitelistedHeaders = {
        headers: {
          correlationId: context.headers['correlation-id'],
          xAppToken: context.headers['x-app-token'],
        },
      };
      const response = handler.buildInput();

      assert.deepEqual(response, whitelistedHeaders);
    });
  });
});
