const { assert } = require('chai');

const jwtGenerator = require('../helpers/jwt-generator');
const authorizationTokenData = require('../fixtures/authentication-token-data');
const { JWT } = require('../../src/security');

function futureDateAsNumericValue(daysToAdd) {
  const futureDate = new Date();
  const withoutMilliseconds = 1000;

  futureDate.setDate(futureDate.getDate() + daysToAdd);

  return Math.floor(futureDate.getTime() / withoutMilliseconds);
}

describe('JWT', () => {
  const jwt = new JWT(process.env.JWT_SECRET_KEY);

  describe('decode()', () => {
    it('returns the token data when a valid token is passed', () => {
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);

      const decoderJwt = jwt.decode(authorizationJwt);

      delete decoderJwt.iat;
      assert.deepEqual(decoderJwt, authorizationTokenData);
    });

    it('returns null when an invalid token is passed', () => {
      const decoderJwt = jwt.decode('notAJWTToken');

      assert.isNull(decoderJwt);
    });
  });

  describe('verify()', () => {
    it('returns the token data when token secret is the same used during the token generation', () => {
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, process.env.JWT_SECRET_KEY);

      const decoderJwt = jwt.verify(authorizationJwt);

      delete decoderJwt.iat;
      assert.deepEqual(decoderJwt, authorizationTokenData);
    });

    it('returns invalid signature error when token secret is not the same used during the token generation', () => {
      const expectedErrorMessage = 'invalid signature';
      const authorizationJwt = jwtGenerator
        .generate(authorizationTokenData, `${process.env.JWT_SECRET_KEY}_EXTRA`);


      try {
        jwt.verify(authorizationJwt);
      } catch (error) {
        assert.equal(error.message, expectedErrorMessage);
      }
    });
  });

  describe('sign()', () => {
    it('returns a jwt with default expiration to the next day', () => {
      const oneDay = 1;
      const signJwt = jwt.sign(authorizationTokenData);
      const decodedJwt = jwt.decode(signJwt);

      assert.isTrue(decodedJwt.exp >= futureDateAsNumericValue(oneDay));
    });

    it('returns a jwt expiration to next week when expiresIn is set to next week', () => {
      const sevenDays = 7;
      const signJwt = jwt.sign(authorizationTokenData, { expiresIn: '1w' });
      const decodedJwt = jwt.decode(signJwt);

      assert.isTrue(decodedJwt.exp >= futureDateAsNumericValue(sevenDays));
    });

    it('returns the error Expected "payload" to be a plain object, when null is passed as the token', () => {
      const expectedErrorMessage = 'Expected "payload" to be a plain object.';

      try {
        jwt.sign(null);
      } catch (error) {
        assert.equal(error.message, expectedErrorMessage);
      }
    });
  });
});
