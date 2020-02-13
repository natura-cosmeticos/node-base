const { assert } = require('chai');
const Koa = require('koa');
const Router = require('koa-router');
const faker = require('faker');
const request = require('supertest');
const sinon = require('sinon');
const uuid = require('uuid/v4');
const { isUUID } = require('validator');

const AuthenticatedHandler = require('../../src/koa/authenticated-handler');
const httpStatus = require('../../src/koa/http-status-enum');
const adapt = require('../../src/koa/handler-to-function-adapter');
const jwtGenerator = require('../helpers/jwt-generator');
const { factory, FakeCommand } = require('../../index').Tests.helpers;
const authorizationTokenData = require('../fixtures/authentication-token-data');
const { App: { baseEvents } } = require('../../index');

describe('AuthenticatedHandler', () => {
  describe('enrich command input', () => {
    it('should add authorization token data when token is valid', async () => {
      // given
      const app = new Koa();
      const fakeCommand = new FakeCommand('success');
      const expectedTokenData = {
        authenticationData: {
          authorizationInfo: authorizationTokenData,
        },
        headers: {

        },
      };
      const spy = sinon.spy();

      fakeCommand.execute = (data) => {
        spy(data);
        fakeCommand.emit(baseEvents.success);
      };

      const router = new Router();

      router.get('/hello', adapt(AuthenticatedHandler, factory(fakeCommand)));

      app.use(router.routes());

      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);

      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt);

      expectedTokenData.headers.authorization = authorizationJwt;

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      sinon.assert.calledWith(spy, expectedTokenData);
    });
  });
  describe('should return 200', () => {
    it('when request has valid authorization', async () => {
      // given
      const app = new Koa();
      const correlationId = uuid();

      const router = new Router();

      router.get('/hello', adapt(AuthenticatedHandler, factory(new FakeCommand('success'))));

      app.use(router.routes());

      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt)
        .set('correlation-id', correlationId);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      assert.equal(response.header['correlation-id'], correlationId);
    });

    it('when request has valid authorization and pass parameters queryString', async () => {
      // given
      const app = new Koa();

      const router = new Router();

      router.get('/hello', adapt(AuthenticatedHandler, factory(new FakeCommand('success'))));

      app.use(router.routes());

      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app.callback()).get('/hello').query({ name: faker.name.firstName() })
        .set('authorization', authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      assert.equal(isUUID(response.header['correlation-id']), true);
    });
  });
});
