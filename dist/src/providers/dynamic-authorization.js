const humps = require('humps');
const { JWT } = require('../security');
const { error } = require('./authorization-enum');


const SECRET_KEY = process.env.JWT_SECRET_KEY || '{000-1-00232-111-931313-13142-12129-24-3333}';


const jsonwebtoken = new JWT(SECRET_KEY);

/**
 *  @constructor
 *  @param {Object} headers Headers received in the application, which contains token's
 *  @param {jsonwebtoken} auth Authentication Method instantiated object, default's to JWT.
 */
class DynamicAuthenticationProdiver {
  constructor({ headers = {}, auth = jsonwebtoken }) {
    this.headers = this.setHeadersToCamelCase(headers);
    this.attributtes = [];
    this.auth = auth;
  }

  /**
   * @private
   */
  setHeadersToCamelCase(headers) {
    return humps.camelizeKeys(headers);
  }

  setHeadersToBeDecrypted(/* istanbul ignore next */ headerAttributes = []) {
    headerAttributes.forEach(({ header, requestProp }) => {
      this.attributtes.push({ header: humps.camelize(header), requestProp });
    });
  }

  /**
   * @private
   * @param {String} token
   */
  decryptToken(token) {
    try {
      this.auth.verify(token);
      const decoded = this.auth.decode(token);

      delete decoded.iat;

      return decoded;
    } catch (exception) {
      throw new Error(exception);
    }
  }

  /**
   * @private
   */
  assignAuthenticatedToRequestProp(headers, attributtes) {
    const validatedTokens = {};

    Object.keys(headers).forEach((header) => {
      attributtes.forEach((attribute) => {
        if (header === attribute.header) {
          validatedTokens[[attribute.requestProp]] = this.decryptToken(headers[header]);
        }
      });
    });

    return validatedTokens;
  }

  /**
   * @private
   */
  getAuthorization() {
    const validatedTokens = this.assignAuthenticatedToRequestProp(this.headers, this.attributtes);

    if (Object.keys(validatedTokens).length === 0) {
      throw new Error(error.noAuthProduced);
    }

    return validatedTokens;
  }
}

module.exports = DynamicAuthenticationProdiver;
