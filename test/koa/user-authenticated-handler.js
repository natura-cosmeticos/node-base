const { assert } = require('chai');
const request = require('supertest');
const Koa = require('koa');
const Router = require('koa-router');
const sinon = require('sinon');

const UserAuthenticatedHandler = require('../../src/koa/user-authenticated-handler');
const httpStatus = require('../../src/koa/http-status-enum');
const adapt = require('../../src/koa/handler-to-function-adapter');
const jwtGenerator = require('../helpers/jwt-generator');
const { factory, FakeCommand } = require('../../index').Tests.helpers;
const authorizationTokenData = require('../fixtures/authentication-token-data');
const { appTokenAttribute } = require('../../src/config');

describe('UserAuthenticatedHandler', () => {
  describe('enrich command input', () => {
    it('should add authorization token data when token is valid', async () => {
      // given
      const app = new Koa();
      const router = new Router();
      const fakeCommand = new FakeCommand('success');

      const spy = sinon.spy();

      fakeCommand.execute = (data) => {
        spy(data);
        fakeCommand.emit('success');
      };

      router.get('/hello', adapt(UserAuthenticatedHandler, factory(fakeCommand)));

      app.use(router.routes());

      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const expectedTokenData = {
        authenticationData: {
          authorizationInfo: authorizationTokenData,
          userInfo: authorizationTokenData,
        },
        headers: {
          authorization: authorizationJwt,
          xAppToken: authorizationJwt,
        },
      };
      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt)
        .set(appTokenAttribute, authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
      sinon.assert.calledWith(spy, expectedTokenData);
    });
  });
  describe('should return 200', () => {
    it('when request has valid authorization', async () => {
      // given
      const app = new Koa();
      const router = new Router();

      router.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));

      app.use(router.routes());
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt)
        .set(appTokenAttribute, authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
    });
  });
  describe('should return 401', () => {
    it('when request has not app token', async () => {
      // given
      const app = new Koa();
      const router = new Router();

      router.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));

      app.use(router.routes());
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.unauthorized);
    });

    it('when app token is invalid', async () => {
      // given
      const app = new Koa();
      const router = new Router();

      router.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));

      app.use(router.routes());
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, `${process.env.JWT_SECRET_KEY}Z`);
      const response = await request(app.callback()).get('/hello')
        .set('authorization', authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.unauthorized);
    });
  });
});
