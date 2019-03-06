const { assert } = require('chai');
const express = require('express');
const request = require('supertest');
const sinon = require('sinon');

const AuthenticatedHandler = require('../../src/express/authenticated-handler');
const httpStatus = require('../../src/express/http-status-enum');
const adapt = require('../../src/express/handler-to-function-adapter');
const jwtGenerator = require('../helpers/jwt-generator');
const { factory, FakeCommand } = require('../../index').Tests.helpers;
const authorizationTokenData = require('../fixtures/authentication-token-data');
const { App: { baseEvents } } = require('../../index');

describe('AuthenticatedHandler', () => {
  describe('enrich command input', () => {
    it('should add authorization token data when token is valid', async () => {
      // given
      const app = express();
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

      app.get('/hello', adapt(AuthenticatedHandler, factory(fakeCommand)));
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app).get('/hello')
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
      const app = express();

      app.get('/hello', adapt(AuthenticatedHandler, factory(new FakeCommand('success'))));
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);
      const response = await request(app).get('/hello')
        .set('authorization', authorizationJwt);

      // then
      assert.equal(response.statusCode, httpStatus.ok);
    });
  });
});
