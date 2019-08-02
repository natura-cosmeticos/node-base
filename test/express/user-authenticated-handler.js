const { assert } = require('chai');
const request = require('supertest');
const express = require('express');
const sinon = require('sinon');

const asyncLocalStorage = require('async-local-storage');
const UserAuthenticatedHandler = require('../../src/express/user-authenticated-handler');
const httpStatus = require('../../src/express/http-status-enum');
const adapt = require('../../src/express/handler-to-function-adapter');
const jwtGenerator = require('../helpers/jwt-generator');
const { factory, FakeCommand } = require('../../index').Tests.helpers;
const authorizationTokenData = require('../fixtures/authentication-token-data');
const { appTokenAttribute } = require('../../src/config');

asyncLocalStorage.enable();

describe('UserAuthenticatedHandler', () => {
  describe('enrich command input', () => {
    it('should add authorization token data when token is valid', () => {
      // given
      const app = express();
      const fakeCommand = new FakeCommand('success');

      const spy = sinon.spy();

      fakeCommand.execute = (data) => {
        spy(data);
        fakeCommand.emit('success');
      };

      app.get('/hello', adapt(UserAuthenticatedHandler, factory(fakeCommand)));
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

      request(app).get('/hello')
        .set('authorization', authorizationJwt)
        .set(appTokenAttribute, authorizationJwt)
        .then((response) => {
          assert.equal(response.statusCode, httpStatus.ok);
          sinon.assert.calledWith(spy, expectedTokenData);
        })
        .catch((error) => {
          throw error;
        });
    });
  });
  describe('should return 200', () => {
    it('when request has valid authorization', () => {
      // given
      const app = express();

      app.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);

      request(app).get('/hello')
        .set('authorization', authorizationJwt)
        .set(appTokenAttribute, authorizationJwt)
        .then((response) => {
          assert.equal(response.statusCode, httpStatus.ok);
        })
        .catch((error) => {
          throw error;
        });
    });
  });
  describe('should return 401', () => {
    it('when request has not app token', () => {
      // given
      const app = express();

      app.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);

      request(app).get('/hello')
        .set('authorization', authorizationJwt)
        .then((response) => {
          assert.equal(response.statusCode, httpStatus.unauthorized);
        })
        .catch((error) => {
          throw error;
        });
    });

    it('when app token is invalid', () => {
      // given
      const app = express();

      app.get('/hello', adapt(UserAuthenticatedHandler, factory(new FakeCommand('success'))));
      // when
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, `${process.env.JWT_SECRET_KEY}Z`);

      request(app).get('/hello')
        .set('authorization', authorizationJwt)
        .then((response) => {
          assert.equal(response.statusCode, httpStatus.unauthorized);
        })
        .catch((error) => {
          throw error;
        });
    });
  });
});
