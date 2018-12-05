const { assert } = require('chai');
const _ = require('lodash');
const { generate } = require('../helpers/jwt-generator');
const tokenData = require('../fixtures/authentication-token-data');
const DynamicAuthorizationProvider = require('../../src/providers/dynamic-authorization');
const { error } = require('../../src/providers/authorization-enum');


describe('DynamicAuthorizationProvider', () => {
  const secret = process.env.JWT_SECRET_KEY;
  const token = generate(tokenData, secret);
  const headers = { 'x-app-token': token, 'x-request-ip': '127.0.0.1' };
  let attributes = [{ header: 'x-app-token', requestProp: 'userInfo' }];

  delete tokenData.iat;
  describe('setHeadersToCamelCase()', () => {
    it('sets headers keys in constructor to camelCase', () => {
      const provider = new DynamicAuthorizationProvider({ headers });

      assert.deepEqual(provider.headers, provider.setHeadersToCamelCase(headers));
    });
  });

  describe('setHeadersToBeDecrypted()', () => {
    it('sets headers in camelCase and requestProp on class, to be used for decryption', () => {
      const provider = new DynamicAuthorizationProvider({ headers });

      attributes = attributes.map(attr => ({
        ...attr,
        header: _.camelCase(attr.header),
      }));
      provider.setHeadersToBeDecrypted(attributes);
      assert.deepEqual(provider.attributtes, attributes);
    });
  });
  describe('decryptToken()', () => {
    it('returns decrypted token as an object', () => {
      const provider = new DynamicAuthorizationProvider({ headers });
      const decrypted = provider.decryptToken(token);

      assert.deepEqual(decrypted, tokenData);
    });
    it('throws an exception if decrypt fail', () => {
      // given
      const authError = new Error('Auth verify error');
      const expectedError = new Error(authError);
      const authMock = {
        decode() {},
        verify() { throw authError; },
      };
      const provider = new DynamicAuthorizationProvider(
        { auth: authMock, headers },
      );

      // when
      try {
        provider.decryptToken(token);
      } catch (exception) {
        assert.equal(expectedError.message, exception.message);
      }
    });
  });
  describe('getAuthorization()', () => {
    it('returns decrypted tokenData received in header in requestProp defined in class constructor', () => {
      const provider = new DynamicAuthorizationProvider({ headers });

      provider.setHeadersToBeDecrypted(attributes);
      const authenticated = provider.getAuthorization();

      assert.deepEqual(authenticated.userInfo, tokenData);
    });

    it('throws an error if no auth produced', () => {
      // given
      const provider = new DynamicAuthorizationProvider({});

      provider.setHeadersToBeDecrypted(attributes);

      // when
      try {
        provider.getAuthorization();
      } catch (exception) {
        assert.deepEqual(exception.message, error.noAuthProduced);
      }
    });
  });
});
